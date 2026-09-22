// Shared helpers for the build-time SEO scripts (sitemap + prerender).
// Bundles the TypeScript SEO data (src/seo/*) with esbuild (already installed as a Vite dependency),
// so the scripts work on any Node version and share exactly the same data as the React app.
import { buildSync } from "esbuild";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

export const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function loadSeo() {
  const out = join(root, "node_modules", ".cache", "teevexa-seo", "seo.mjs");
  mkdirSync(dirname(out), { recursive: true });
  buildSync({
    stdin: {
      contents: `export * from "./src/seo/routes"; export * from "./src/seo/site";`,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: out,
    logLevel: "error",
  });
  return import(pathToFileURL(out).href + `?t=${Date.now()}`);
}

/** Loads VITE_* variables from .env for local builds (Vercel provides them as real env vars). */
export function loadEnv() {
  try {
    const f = join(root, ".env");
    if (!existsSync(f)) return;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const m = /^(VITE_[A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* ignore */ }
}

/** Published rows for dynamic pages. Returns [] (never throws) if Supabase is unreachable. */
export async function fetchRows(table, select, filter) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=${select}&${filter}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[seo] skipped ${table}: ${e.message}`);
    return [];
  }
}

export const DYNAMIC = [
  { table: "blog_posts", base: "/insights", select: "slug,title,excerpt,cover_image_url,published_at,updated_at", filter: "status=eq.published" },
  { table: "case_studies", base: "/portfolio", select: "slug,title,description,cover_image_url,published_at,updated_at", filter: "status=eq.published" },
  { table: "jobs", base: "/careers", select: "slug,title,department,location,employment_type,description,created_at,updated_at", filter: "status=eq.open" },
];
