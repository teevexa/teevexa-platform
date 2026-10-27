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

**Attempted, not a skipped step**: I called the real PageSpeed Insights API directly (`googleapis.com/pagespeedonline/v5/runPagespeed`) against `https://www.teevexa.com/`. It returned `429 RESOURCE_EXHAUSTED`, and the response body shows `quota_limit_value: "0"` for unauthenticated callers, meaning this is not a transient rate limit to retry, the endpoint structurally requires a Google API key now. I do not have one and have not fabricated a result in its place.

**What I recommend doing next**: either (a) run `https://pagespeed.web.dev/` yourself against `https://www.teevexa.com` for the homepage and one or two inner pages, no key needed for the human-facing tool, or (b) give me a free Google Cloud API key with the PageSpeed Insights API enabled and I will run it and record the real numbers here. I have deliberately not invented or estimated LCP/INP/CLS values in their place.

**Resolved: real measurement obtained (2026-10-27).** You ran `pagespeed.web.dev` against the homepage yourself and shared both reports.

| Metric | Desktop | Mobile |
| --- | --- | --- |
| Performance score | 98 | 78 |
| Accessibility / Best Practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |
| FCP | 0.8s | 3.8s |
| LCP | 0.9s | 4.1s |
| TBT | 0ms | 0ms |
| CLS | **0** | **0** |
| Speed Index | 0.8s | 3.8s |

Both reports show "Discover what your real users are experiencing: No Data", meaning Google has no CrUX field data for this domain yet (too young/low-traffic to have accumulated it). This lab score, especially the mobile 78, is measured under Lighthouse's deliberately pessimistic "Slow 4G" throttling profile, not representative of most real visitors' actual connections, and Core Web Vitals as an actual Google ranking signal is based on real-user field data, which doesn't exist yet for this domain either way.

**CLS = 0 on both confirms a judgment call from earlier in this plan was correct**: the decision not to add explicit `width`/`height` attributes to images, reasoning that the existing Tailwind `aspect-video`/fixed-height containers already prevented layout shift, is now empirically validated rather than just argued.

**The flagged "177 KiB unused JavaScript" was investigated, not assumed.** The concern was that the admin dashboard's charting library (Recharts, ~368 KB) might be leaking into the public bundle. Checked directly against the real build output (`npm run build`): it isn't, Recharts' heavy code (`generateCategoricalChart-*.js`) sits in its own separate chunk, never downloaded by a public visitor, confirming the bundle-size note earlier in this document was accurate. The actual cause was `App.tsx` importing every public page eagerly rather than route-splitting them the way admin/portal routes already are, so visiting the homepage downloaded code for pages not yet visited.

**Fixed (2026-10-27).** All public pages except `Index` and `Layout` (kept static so the most common entry point has zero extra round trip) are now `React.lazy()`-loaded, using the same `Suspense`/`RouteFallback` pattern already in place for admin/portal. Verified against the real build output: the main `index-*.js` bundle dropped from 606 KB to **178 KB** (gzip 159 KB to 53 KB), with each public page now its own small on-demand chunk (`Contact` 11 KB, `Services` 13.5 KB, `About` 15 KB, etc.). `npm test`, `tsc`, and `npm run lint` all clean afterward; the existing "routes stay in sync with the app" test in `src/test/seo.test.ts` still passes unmodified, since it matches on the `<Route element={<X` JSX pattern, not the import style.

**The trade-off this accepted**: a visitor's second, third, etc. page within a session now fetches a small chunk on first visit to each new page (rather than everything being already downloaded). Given scores were already strong before this change, this was a deliberate choice to shrink the baseline bundle further, not a fix for a failing score.

**Render-blocking requests (160ms desktop, 750ms mobile) is most likely the Google Fonts `<link>`**, exactly the self-hosting option flagged earlier in this document as "worth doing once there's a measured baseline." That baseline now exists; self-hosting the fonts is proposed but not yet implemented, pending your go-ahead since it touches every page's font loading.

## 5. Structured data

All structured data in the codebase was audited (full list in `01-initial-audit.md` §3) before any change was made, per this engagement's explicit instruction. Changes made:

- `articleLd()` (`src/seo/site.ts`) now accepts an optional `author` string and emits a real `Person` schema when given, falling back to the existing `Organization` schema otherwise. Covered by two new tests in `src/test/seo.test.ts`.
- No new schema types were added speculatively. `Review`/`AggregateRating` was explicitly considered and rejected for case studies and products, since no genuine review/rating data exists anywhere in the codebase; adding it would violate this engagement's explicit prohibition on fabricated review data.
- No `LocalBusiness` schema was added. Teevexa is a remote-first, worldwide-serving company operating from Nairobi; it does not describe itself as a storefront with walk-in customers, and the existing `Organization`/`ProfessionalService` combination (already in `globalJsonLd()`) is the more accurate type. Revisit only if the business's self-description changes.

**Validation performed**: Google's Rich Results Test requires a JS-driven browser session I don't have access to from this environment (confirmed by attempting it: the fetched page is only the empty input form, the validation itself runs client-side). As a substitute, I pulled the real, live JSON-LD from four representative pages (homepage, a service page, the published blog post, the Teevexa Trace product page) and checked each block by hand against schema.org's and Google's documented required/recommended properties: all blocks are syntactically valid JSON, every `Article` has `headline`, `image`, `datePublished`, `dateModified`, a real `Person` or `Organization` `author`, and a `publisher` that correctly resolves via `@id` reference to the page's own `Organization` node; every `BreadcrumbList` has sequential positions and absolute URLs; `SoftwareApplication` has `operatingSystem`, `applicationCategory` and `offers`. This is a real check with real evidence, not a guess, but it is a manual substitute for Google's own tool, not that tool's verdict. If you want Google's own tool's result, paste `https://www.teevexa.com` and the published post's URL into `https://search.google.com/test/rich-results` yourself; it takes about a minute per URL.

## 6. Open items (not implemented, with reasons)

1. ~~**Vercel Deploy Hook URL**~~ **Done.** You created the hook, I deployed `trigger-rebuild` and set the secret; both verified live (see `06-implementation-log.md`, `07-validation-report.md` §9a/§9c), and proven end-to-end when the first real post published itself through the pipeline automatically.
2. ~~**Apply the database migration**~~ **Done.** Applied and verified live.
3. **Edge Middleware for true 404s**: deferred; see `01-initial-audit.md` §4.9 and `09-prioritized-roadmap.md`.
4. ~~**Real Core Web Vitals measurement**~~ **Done.** You ran `pagespeed.web.dev` and shared real desktop and mobile reports; see above.
5. ~~**Font self-hosting**~~ **Done.** Inter and Sora (variable fonts, latin + latin-ext subsets, 4 files totaling ~167 KB) downloaded from Google Fonts' own CDN once and now served from `public/fonts/`. `index.html`'s external Google Fonts `<link>` and `preconnect` tags removed, replaced with `@font-face` in `src/index.css` and two `<link rel="preload">` hints for the primary latin files. Verified: `dist/index.html` has zero remaining references to `fonts.googleapis.com`/`fonts.gstatic.com`, fonts are copied into the build output, and the compiled CSS references the correct local paths.
6. ~~**Public-page route-splitting**~~ **Done.** See above; real trade-off accepted (brief per-page first-visit fetch vs. a smaller baseline bundle for everyone), not a bug fix.
7. **`llms.txt`**: added (`public/llms.txt`), reversing the earlier "wait" recommendation in `05-ai-search-strategy.md` after Lighthouse's new Agentic Browsing category (Lighthouse 13.3, ~2026-05) started checking for one directly, concrete new evidence, not present when the original call was made.
8. **WebMCP / the "Agentic Browsing" `ai-catalog.json` check**: deliberately not pursued. Genuinely experimental (most sites fail this check currently), the browser API itself is still being defined, and implementing it would be real speculative engineering against an unstable spec. Revisit in 6-12 months, not now.
