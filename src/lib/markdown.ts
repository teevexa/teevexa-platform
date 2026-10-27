// Small, safe Markdown -> HTML renderer for blog posts (headings, lists, quotes, code, links, emphasis).
// All text is HTML-escaped first; only a fixed set of tags is ever emitted, and link URLs are
// restricted to http(s), mailto and same-site paths, so untrusted content cannot inject markup or scripts.

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const safeUrl = (url: string): string | null => {
  const u = url.trim().replace(/&amp;/g, "&");
  if (/^(https?:\/\/|mailto:)/i.test(u) || (u.startsWith("/") && !u.startsWith("//"))) {
    return escapeHtml(u);
  }
  return null;
};

function inline(raw: string): string {
  const codes: string[] = [];
  let s = escapeHtml(raw).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${c}</code>`);
    return `\uE000${codes.length - 1}\uE001`;
  });
  s = s
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
      const href = safeUrl(url);
      if (!href) return text;
      const external = /^https?:/i.test(url);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    });
  return s.replace(/\uE000(\d+)\uE001/g, (_, i) => codes[Number(i)]);
}

export function renderMarkdown(md: string): string {
  const lines = (md || "").replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let para: string[] = [];
  let code: string[] | null = null;

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(inline).join("<br/>")}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith("```")) {
        out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
      } else code.push(line);
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushPara();
      closeList();
      code = [];
      continue;
    }
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    const h = /^(#{1,4})\s+(.+)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const level = Math.min(h[1].length + 1, 5); // post title is the h1, so # renders as h2
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushPara();
      closeList();
      out.push("<hr/>");
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      closeList();
      out.push(`<blockquote><p>${inline(q[1])}</p></blockquote>`);
      continue;
    }
    const li = /^\s*(?:([-*])|(\d+)\.)\s+(.+)$/.exec(line);
    if (li) {
      flushPara();
      const kind = li[1] ? "ul" : "ol";
      if (list !== kind) {
        closeList();
        out.push(`<${kind}>`);
        list = kind;
      }
      out.push(`<li>${inline(li[3])}</li>`);
      continue;
    }
    closeList();
    para.push(line);
  }
  if (code) out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  flushPara();
  closeList();
  return out.join("\n");
}

/**
 * Pulls real Q&A pairs out of a post's own "Frequently asked questions" section (the convention
 * used by every blog post), so FAQPage structured data is generated from the single source of
 * truth, the article body, rather than a separate field an editor could forget to keep in sync.
 * Matches the authored pattern exactly: a `**Question?**` line followed by its answer paragraph,
 * pairs separated by a blank line. Returns [] if the post has no such section; that's expected
 * for posts that don't end in an FAQ, not an error.
 */
export function extractFaqs(markdown: string): { q: string; a: string }[] {
  const section = /#{1,4}\s*Frequently asked questions\s*\n+([\s\S]*)/i.exec(markdown || "");
  if (!section) return [];
  const pairs = [...section[1].matchAll(/\*\*([^*]+)\*\*\n([\s\S]*?)(?=\n\n\*\*|\s*$)/g)];
  return pairs
    .map((m) => ({ q: m[1].trim(), a: m[2].trim().replace(/\s+/g, " ") }))
    .filter((f) => f.q && f.a);
}
