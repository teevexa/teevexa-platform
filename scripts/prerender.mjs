// Post-build: writes a real HTML file for every public route with the correct <title>, description, canonical,
// Open Graph / Twitter tags, JSON-LD and a text fallback. Crawlers and link-preview bots that do not run
// JavaScript therefore see complete metadata. The React app still boots normally on top of the same file.
// Hosting (Vercel) serves an existing file before applying the SPA rewrite, so /about -> dist/about/index.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { DYNAMIC, fetchRows, loadEnv, loadSeo, root } from "./seo-lib.mjs";

loadEnv();
const seo = await loadSeo();
const dist = join(root, "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");
const START = "<!--seo:start-->";
const END = "<!--seo:end-->";
if (!template.includes(START) || !template.includes(END)) {
  console.error("[prerender] seo markers missing in dist/index.html; skipping");
  process.exit(0);
}

const escAttr = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escText = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const ldTag = (o) => `    <script data-prerender type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const trim = (s, n) => { const t = String(s ?? "").replace(/\s+/g, " ").trim(); return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+\S*$/, "") + "…"; };

const fullTitle = seo.fullTitle;

function head(p) {
  const title = fullTitle(p.title);
  const url = seo.absoluteUrl(p.path);
  const image = p.image || seo.DEFAULT_OG_IMAGE;
  const isDefault = image === seo.DEFAULT_OG_IMAGE;
  const crumbs = p.noindex ? [] : seo.breadcrumbItems(p.path, p.crumb);
  const ld = [
    ...seo.globalJsonLd(),
    ...(p.jsonLd || []),
    ...(crumbs.length > 1 ? [seo.breadcrumbLd(crumbs)] : []),
  ];
  const m = (attr, name, content) => `    <meta data-prerender ${attr}="${name}" content="${escAttr(content)}" />`;
  return [
    `    <title data-prerender>${escText(title)}</title>`,
    m("name", "description", p.description),
    `    <link data-prerender rel="canonical" href="${escAttr(url)}" />`,
    m("name", "robots", p.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"),
    m("property", "og:site_name", seo.SITE_NAME),
    m("property", "og:locale", seo.LOCALE),
    m("property", "og:type", p.ogType || "website"),
    m("property", "og:title", title),
    m("property", "og:description", p.description),
    m("property", "og:url", url),
    m("property", "og:image", image),
    m("property", "og:image:alt", title),
    ...(isDefault ? [m("property", "og:image:width", "1200"), m("property", "og:image:height", "630")] : []),
    ...(p.published ? [m("property", "article:published_time", p.published)] : []),
    ...(p.modified ? [m("property", "article:modified_time", p.modified)] : []),
    m("name", "twitter:card", "summary_large_image"),
    m("name", "twitter:site", seo.TWITTER_HANDLE),
    m("name", "twitter:title", title),
    m("name", "twitter:description", p.description),
    m("name", "twitter:image", image),
    m("name", "twitter:image:alt", title),
    ...ld.map(ldTag),
  ].join("\n");
}

const NAV = [["/", "Home"], ["/services", "Services"], ["/prototype-to-production", "Prototype to Production"], ["/portfolio", "Our Work"], ["/insights", "Insights"], ["/about", "About"], ["/contact", "Contact"], ["/start-project", "Get a Quote"]];

function fallback(p) {
  const h1 = p.h1 || fullTitle(p.title).split(" | ")[0];
  return `\n    <noscript><main style="font-family:sans-serif;max-width:720px;margin:40px auto;padding:0 16px"><h1>${escText(h1)}</h1><p>${escText(p.description)}</p><nav aria-label="Main"><ul>${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></nav><p>Teevexa Ltd, Nairobi, Kenya. <a href="mailto:hello@teevexa.com">hello@teevexa.com</a></p></main></noscript>`;
}

let written = 0;
function write(path, page) {
  const html = template
    .replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${head({ ...page, path })}\n    ${END}`)
    .replace('<div id="root"></div>', `<div id="root"></div>${fallback(page)}`);
  const file = path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  written++;
}

// 1) Static pages
for (const [path, meta] of Object.entries(seo.PAGES)) write(path, meta);

// 2) Published dynamic pages (needs the public Supabase env vars at build time)
const counts = {};
for (const d of DYNAMIC) {
  const rows = await fetchRows(d.table, d.select, d.filter);
  counts[d.table] = rows.length;
  for (const r of rows) {
    if (!r.slug) continue;
    const path = `${d.base}/${r.slug}`;
    if (d.table === "blog_posts") {
      const description = trim(r.excerpt || `Read ${r.title} on the Teevexa engineering blog.`, 158);
      write(path, {
        title: r.title, h1: r.title, description, crumb: r.title, ogType: "article", image: r.cover_image_url,
        published: r.published_at, modified: r.updated_at,
        jsonLd: [seo.articleLd({ title: r.title, description, path, image: r.cover_image_url, published: r.published_at, modified: r.updated_at })],
      });
    } else if (d.table === "case_studies") {
      write(path, { title: r.title, h1: r.title, description: trim(r.description, 158), crumb: r.title, image: r.cover_image_url });
    } else {
      const description = trim(`${r.title} (${r.employment_type}) in ${r.location}. Join Teevexa and help build AI-native software and supply chain products.`, 158);
      write(path, {
        title: `${r.title} — ${r.department} | Teevexa Careers`, h1: r.title, description, crumb: r.title,
        jsonLd: [seo.jobPostingLd({ title: r.title, description: trim(r.description, 4000), path, posted: r.created_at, employmentType: r.employment_type, location: r.location })],
      });
    }
  }
}
console.log(`[prerender] wrote ${written} HTML files (${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(", ")})`);
