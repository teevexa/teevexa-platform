# Technical SEO Plan: teevexa-web

This document records every technical SEO decision made in this engagement, what was implemented versus what remains open, and why. Full file-by-file change list is in `06-implementation-log.md`; this document is the decisions and reasoning.

## 1. Crawling and indexation

| Item | Decision | Status |
| --- | --- | --- |
| SPA fallback rewrite | Replace the broken `(?!api/)` lookahead rewrite with the standard `/(.*)` pattern | **Implemented** in `vercel.json`, not deployed (your choice, see `01-initial-audit.md` §9) |
| Retired URL redirects | Real HTTP 301/308 redirects for `/teevexa-desk` and `/teevexa-base` | **Implemented** in `vercel.json`, not deployed |
| `robots.txt` | No change: already correctly disallows `/admin/`, `/client-portal/`, `/auth`, `/forgot-password`, `/reset-password`, and allows everything else including all AI crawlers (your explicit decision; see `05-ai-search-strategy.md`) | No change needed |
| Sitemap | Exclude individual dynamic records marked `seo_noindex` | **Implemented** in `scripts/generate-sitemap.mjs` |
| Sitemap segmentation | Not needed. Current sitemap has 25 URLs; even with active blog/case-study/job publishing, this site will likely stay well under the ~50,000-URL single-sitemap limit for years. Revisit only if that changes. | Deferred, not currently applicable |
| Duplicate URLs from tracking params/case/trailing slash | `vercel.json` already sets `"cleanUrls": true, "trailingSlash": false`; React Router paths are fixed strings, not query-driven. No faceted navigation or filter-generated URLs exist anywhere on the site (confirmed: the only client-side filter, the Insights tag filter, does not change the URL). | Already correct, no change needed |
| Soft-404 for unknown paths | Accepted tradeoff for a static-hosted SPA; see `01-initial-audit.md` §4.9 for the full reasoning. A true Edge Middleware 404 solution is deferred to the roadmap given its complexity relative to current impact. | Documented, deferred |

## 2. Rendering and indexable content

| Item | Decision | Status |
| --- | --- | --- |
| Dynamic content body not in prerendered HTML | Extended `scripts/prerender.mjs` to render the real article/case-study body (via the existing `renderMarkdown()` from `src/lib/markdown.ts`, bundled into the build script with esbuild) directly inside `<div id="root">`, which React's `createRoot().render()` cleanly replaces for real visitors with no hydration mismatch | **Implemented**, verified by running `npm run build` end-to-end and by calling the bundled `renderMarkdown` directly (see `07-validation-report.md`); not yet verified against a real published post since none exist |
| CMS-level SEO overrides | Added `meta_title`, `meta_description`, `seo_noindex` (both tables) and `author_name` (`blog_posts` only) columns via migration, wired into `InsightDetail.tsx`, `PortfolioDetail.tsx`, `AdminBlog.tsx`, `AdminPortfolio.tsx`, and the prerender/sitemap scripts | **Implemented**; migration not yet applied to the database (see `06-implementation-log.md`) |
| Generic metadata for every dynamic page | Not an issue: titles/descriptions were already derived per-record from `title`/`excerpt`/`description` before this session; the new override fields make this stronger, not different | Already correct |
| Loading states / empty states | Already handled well: `Insights.tsx` and `/careers`/`/portfolio` show an honest "nothing published yet" state rather than fake placeholder content | Already correct, preserved |
| Public API failures leaving empty content | `scripts/seo-lib.mjs`'s `fetchRows()` already catches any fetch error and returns `[]` rather than throwing, so a Supabase outage at build time degrades to "0 dynamic pages" rather than failing the whole build | Already correct, preserved |

## 3. URL architecture

No URL changes were made or are recommended. Every existing static URL is descriptive, stable, and already reflects the site's information architecture correctly (confirmed in `02-url-inventory.md`). The only URL-level change in this engagement is making the two already-intended redirects (`/teevexa-desk`, `/teevexa-base`) actually work as real HTTP redirects instead of broken 404s.

## 4. Core Web Vitals and performance

I did not run a live Lighthouse/PageSpeed Insights measurement against the production site in this pass (no tool access to do so from this environment without a live browser session). What I changed, based on static code inspection rather than a measured score:

| Item | Change | Reasoning |
| --- | --- | --- |
| Blog/case-study listing images | Added `loading="lazy" decoding="async"` to below-the-fold grid images (`Insights.tsx`) | Reduces initial page weight; these images are off-screen on load |
| Featured/hero/cover images | Added `loading="eager" decoding="async"` explicitly (was implicit `eager` by default; made explicit and paired with async decode) | These are above-the-fold/LCP-candidate images; explicit `eager` plus async decode avoids the image blocking the main thread during decode |
| Portfolio grid thumbnails | Already had `loading="lazy"` (pre-existing, confirmed, not changed) | |
| Explicit `width`/`height` attributes | **Not added.** Images are sized via Tailwind utility classes (`aspect-video`, fixed-height containers) that already reserve layout space via CSS before the image loads, which addresses the CLS risk these attributes exist to prevent. Adding literal pixel `width`/`height` to images in a fluid, responsive grid would conflict with that existing responsive sizing. | Judgment call: the CSS-based approach already in place is a valid alternative to intrinsic-size attributes for this specific layout pattern |
| Fonts | Not changed. Google Fonts are loaded with `rel="preconnect"` already in place; self-hosting fonts would be a bigger, separate change with its own tradeoffs (cache control, update process) | Flagged as a possible future optimization, not implemented without a measured baseline justifying the effort |
| Bundle size | Not changed. `vite build`'s own output already warns that `index-*.js` is ~606 kB (gzip ~159 kB) and `generateCategoricalChart` (Recharts) is ~368 kB; both come from dependencies used across many admin/portal pages that are already lazy-loaded separately from the public bundle (`App.tsx`'s `React.lazy` calls, confirmed pre-existing). A deeper bundle-splitting pass is a legitimate improvement but is a frontend performance project in its own right, not a contained SEO task; recommended as a roadmap item, not implemented here. | Deferred, documented |

**What I recommend doing next, with tooling I don't have access to from here**: run `https://pagespeed.web.dev/` against `https://www.teevexa.com` for the homepage and one or two representative inner pages, and record the real LCP/INP/CLS numbers in `07-validation-report.md`'s "not yet measured" section once available. I have deliberately not invented or estimated these numbers.

## 5. Structured data

All structured data in the codebase was audited (full list in `01-initial-audit.md` §3) before any change was made, per this engagement's explicit instruction. Changes made:

- `articleLd()` (`src/seo/site.ts`) now accepts an optional `author` string and emits a real `Person` schema when given, falling back to the existing `Organization` schema otherwise. Covered by two new tests in `src/test/seo.test.ts`.
- No new schema types were added speculatively. `Review`/`AggregateRating` was explicitly considered and rejected for case studies and products, since no genuine review/rating data exists anywhere in the codebase; adding it would violate this engagement's explicit prohibition on fabricated review data.
- No `LocalBusiness` schema was added. Teevexa is a remote-first, worldwide-serving company operating from Nairobi; it does not describe itself as a storefront with walk-in customers, and the existing `Organization`/`ProfessionalService` combination (already in `globalJsonLd()`) is the more accurate type. Revisit only if the business's self-description changes.

## 6. Open items (not implemented, with reasons)

1. **Vercel Deploy Hook URL**: the `trigger-rebuild` edge function (see `06-implementation-log.md`) is written and gated to staff-only callers, but does nothing until a `DEPLOY_HOOK_URL` secret is set, because I cannot create a Vercel Deploy Hook from this environment. Create one in Vercel (Project Settings → Git → Deploy Hooks, pick the production branch) and run `supabase secrets set DEPLOY_HOOK_URL=<url>`.
2. **Apply the database migration**: `supabase/migrations/20261027000000_blog_and_case_study_seo_fields.sql` needs `supabase db push` (or equivalent) before the new admin SEO fields will actually save. Until then, the admin UI's new fields exist but saving a post/case study with those fields filled in will error, since the underlying columns don't exist yet. This mirrors the deploy pattern already established in this engagement (you run migrations; I prepare them).
3. **Edge Middleware for true 404s**: deferred; see `01-initial-audit.md` §4.9 and `09-prioritized-roadmap.md`.
4. **Real Core Web Vitals measurement**: deferred; needs a live tool run, not code access.
5. **Font self-hosting**: deferred, flagged as a possible future optimization only.
