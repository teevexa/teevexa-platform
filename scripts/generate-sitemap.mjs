// Generates public/sitemap.xml at build time from the SEO route table (src/seo/routes.ts)
// plus published blog posts, case studies and jobs. Never fails the build.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { DYNAMIC, fetchRows, loadEnv, loadSeo, root } from "./seo-lib.mjs";

loadEnv();
const seo = await loadSeo();

const staticRoutes = Object.entries(seo.PAGES)
  .filter(([, m]) => !m.noindex)
  .map(([path, m]) => ({ path, freq: m.changefreq || "monthly", prio: m.priority ?? 0.5 }));

const dynamic = [];
for (const d of DYNAMIC) {
  for (const r of await fetchRows(d.table, d.select, d.filter)) {
    if (r.slug) dynamic.push({ path: `${d.base}/${r.slug}`, freq: "monthly", prio: 0.6, lastmod: r.updated_at || r.published_at || r.created_at });
  }
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const urls = [...staticRoutes, ...dynamic]
  .map((u) =>
    `  <url>\n    <loc>${esc(seo.absoluteUrl(u.path))}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().slice(0, 10)}</lastmod>` : ""}\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.prio.toFixed(2)}</priority>\n  </url>`)
  .join("\n");

writeFileSync(join(root, "public", "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`[sitemap] wrote ${staticRoutes.length + dynamic.length} URLs (${dynamic.length} dynamic)`);
