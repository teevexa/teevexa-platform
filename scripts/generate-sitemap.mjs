// Generates public/sitemap.xml at build time: static routes + published blog posts + published case studies.
// Never fails the build: if Supabase isn't reachable it writes the static routes only.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://teevexa.com";

// Load VITE_* vars from .env when not already in the environment (local builds).
try {
  const envFile = join(root, ".env");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
} catch { /* ignore */ }

// Legal pages are intentionally noindex, so they are not listed here.
const staticRoutes = [
  ["/", "weekly", 1.0],
  ["/prototype-to-production", "monthly", 0.95],
  ["/start-project", "monthly", 0.9],
  ["/services", "monthly", 0.9],
  ["/services/ai-agents", "monthly", 0.8],
  ["/services/web-development", "monthly", 0.8],
  ["/services/mobile-development", "monthly", 0.8],
  ["/services/e-commerce-systems", "monthly", 0.8],
  ["/services/enterprise-software", "monthly", 0.8],
  ["/services/ui-ux-design", "monthly", 0.8],
  ["/portfolio", "weekly", 0.8],
  ["/insights", "weekly", 0.8],
  ["/teevexa-trace", "monthly", 0.8],
  ["/teevexa-field", "monthly", 0.7],
  ["/pricing", "monthly", 0.7],
  ["/verify", "monthly", 0.5],
  ["/api-docs", "monthly", 0.5],
  ["/open-source", "monthly", 0.6],
  ["/teedesk", "monthly", 0.6],
  ["/cyberguard-ai", "monthly", 0.6],
  ["/accessibility", "yearly", 0.3],
  ["/about", "monthly", 0.7],
  ["/careers", "weekly", 0.6],
  ["/contact", "monthly", 0.7],
  ["/book-consultation", "monthly", 0.7],
];

async function fetchRows(table, select, filter) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/${table}?select=${select}&${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`);
  return res.json();
}

const dynamic = [];
for (const [table, base, select, dateField] of [
  ["blog_posts", "/insights", "slug,updated_at,published_at", "updated_at"],
  ["case_studies", "/portfolio", "slug,updated_at,published_at", "updated_at"],
  ["jobs", "/careers", "slug,updated_at", "updated_at"],
]) {
  try {
    const rows = await fetchRows(table, select, table === "jobs" ? "status=eq.open" : "status=eq.published");
    for (const r of rows) if (r.slug) dynamic.push([`${base}/${r.slug}`, "monthly", 0.6, r[dateField]]);
  } catch (e) {
    console.warn(`[sitemap] skipped ${table}: ${e.message}`);
  }
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const urls = [...staticRoutes, ...dynamic]
  .map(([path, freq, prio, lastmod]) =>
    `  <url>\n    <loc>${esc(SITE + path)}</loc>${lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}\n    <changefreq>${freq}</changefreq>\n    <priority>${prio.toFixed(2)}</priority>\n  </url>`)
  .join("\n");

writeFileSync(join(root, "public", "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`[sitemap] wrote ${staticRoutes.length + dynamic.length} URLs (${dynamic.length} dynamic)`);
