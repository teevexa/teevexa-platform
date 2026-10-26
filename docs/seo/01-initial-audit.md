# SEO Initial Audit: teevexa-web

Date: 2026-10-26
Scope: `apps/teevexa-web` (the `teevexa.com` marketing site, quote funnel, client portal, admin panel, and the public Teevexa Trace verification pages).
Method: full recursive inspection of the repository (routing, pages, SEO data layer, build scripts, Supabase schema and RLS policies, edge functions, config), plus live HTTP checks against `https://www.teevexa.com` and live queries against the production Supabase database. Findings below are evidence-based; anything that could not be verified from the code or a live check is explicitly marked as such.

---

## 1. Business baseline

- **Company**: Teevexa Ltd, a Nairobi, Kenya-based software studio. Confirmed from `src/seo/site.ts` (`globalJsonLd`), `README.md`, and the live site.
- **Domain**: `https://www.teevexa.com` (canonical host; `SITE_URL` constant in `src/seo/site.ts:4`). The apex `teevexa.com` is not verified to redirect to `www` from the codebase; this is DNS/hosting configuration outside the repo (see Section 9).
- **Target market**: stated as "worldwide" in structured data (`areaServed: "Worldwide"`), with an explicit Nairobi/Kenya base. No evidence of any geo-specific landing pages, which is consistent with a single global market (not multi-location).
- **Products**: a software development services business (web, mobile, AI agents, e-commerce, enterprise software, UI/UX), plus three shipped products: **Teevexa Trace** and **Teevexa Field** (Android apps on Google Play, supply chain traceability), and two open-source projects, **TeeDesk** and **CyberGuard AI**, documented in sibling repositories.
- **Business model confirmed from code**: an account-less quote funnel (`/start-project`) is the primary conversion path; a 20-minute consultation booking system is secondary. There is no e-commerce checkout on this site itself.

## 2. Technology stack and rendering architecture

- **Framework**: React 18 + TypeScript, built with Vite 5, routed client-side with `react-router-dom` (`src/App.tsx`).
- **Rendering strategy**: client-side rendered SPA, with a **build-time static HTML prerender step** layered on top. This is not SSR and not a framework-level SSG (no Next.js/Remix/Astro): it is a custom two-script pipeline:
  - `scripts/generate-sitemap.mjs` (runs as `prebuild`): writes `public/sitemap.xml` from `src/seo/routes.ts` plus live Supabase queries for published `blog_posts`, `case_studies` and `jobs`.
  - `scripts/prerender.mjs` (runs as `postbuild`): after `vite build`, writes a real `dist/<route>/index.html` for every static route in `src/seo/routes.ts` and for every published dynamic row, injecting `<title>`, meta description, canonical, Open Graph/Twitter tags and JSON-LD directly into the HTML (between `<!--seo:start-->`/`<!--seo:end-->` markers in `index.html`), plus a `<noscript>` fallback with an H1, description and nav links.
  - Both scripts share `scripts/seo-lib.mjs`, which bundles the TypeScript SEO data (`src/seo/routes.ts`, `src/seo/site.ts`) with esbuild so the build scripts and the React app read from exactly one source of truth.
  - At runtime in the browser, `src/components/SEO.tsx` (via `react-helmet-async`) re-applies the same metadata client-side, so client-side navigation between routes still updates the `<title>`/meta tags correctly (prerendering only covers the *first* HTML response).
- **Hosting**: Vercel (`vercel.json`), static output from `dist/`.
- **Database/backend**: Supabase (Postgres with Row Level Security, Auth, Storage, Realtime, Deno edge functions under `supabase/functions/`).
- **This is a genuinely good architecture for SEO** relative to a plain CSR SPA: real static HTML exists on disk for every known route at deploy time, so a crawler or AI retrieval bot that does not execute JavaScript still gets correct `<title>`, description, canonical, Open Graph and JSON-LD for the page shell. The gap is what happens **between deploys** and **inside the body** of dynamic content; see Sections 4 and 5.

## 3. Existing SEO implementation (what to preserve)

This codebase already has a materially above-average SEO foundation. Do not replace it; the plan in later documents extends it.

- **Single source of truth for metadata**: `src/seo/routes.ts` (`PAGES` record) drives the `<SEO>` component, the sitemap generator and the prerender script identically. There is no route with hand-duplicated metadata.
- **`src/seo/site.ts`** centralizes `SITE_URL`, JSON-LD builders (`globalJsonLd`, `breadcrumbLd`, `faqLd`, `serviceLd`, `androidAppLd`, `openSourceLd`, `webPageLd`, `articleLd`, `jobPostingLd`) and absolute-URL helpers. Every structured-data object is built from real page data, not hardcoded.
- **Automated SEO tests already exist** (`src/test/seo.test.ts`, 13 tests, all passing): enforce title length ≤ 60 chars (with brand suffix), description length 110-160 chars, title/description uniqueness across all pages, brand mention in every title, `noindex` pages correctly excluded from `INDEXABLE_PATHS`, every static `<Route>` in `App.tsx` has a matching `PAGES` entry (and vice versa), every `ServiceDetail` slug has matching SEO data, breadcrumb JSON-LD structure, and canonical URL formatting (no trailing slash). Full suite (`npm test`, 31 tests across 3 files) passes as of this audit.
- **Indexability decisions are already deliberate and correct in several places**, not accidental: `noindex` is explicitly set on legal pages, the account-deletion instructions page, 404s, "not found" states for dynamic records, and individual batch-verification pages (`TraceBatch.tsx:371`), which are correctly treated as private per-customer lookups rather than public content.
- **`robots.txt`** correctly blocks `/admin/`, `/client-portal/`, `/auth`, `/forgot-password`, `/reset-password` and points to the sitemap. It does not use `noindex`-via-robots.txt as a substitute for real access control (RLS and route guards exist independently; see Section 6).
- **Open Graph and Twitter Card metadata, breadcrumb `BreadcrumbList` JSON-LD, `Organization`/`ProfessionalService`/`WebSite` JSON-LD, FAQ JSON-LD, `SoftwareApplication` JSON-LD for the two Android apps, and `SoftwareSourceCode` JSON-LD for the two open-source projects** are all already implemented and derived from real content (verified in `src/seo/site.ts` and `src/seo/routes.ts`).
- **`og-image.png` is a real 1200x630 image** (verified with a PNG header read), matching the dimensions declared in its own meta tags. Not a placeholder.
- **Accessibility-adjacent SEO signals**: `lang="en"` set via Helmet, skip-link patterns referenced in the prior README audit, WCAG 2.2 AA stated as a goal with a dedicated `/accessibility` page.

## 4. Critical and high-severity technical findings

### 4.1 [CRITICAL, FIXED THIS SESSION] Broken SPA fallback rewrite returned a bare 404 for every non-prerendered route in production

**Evidence**: `vercel.json` (before this session) contained:
```json
"rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
```
Live verification against `https://www.teevexa.com` (before the fix):

| Path | Status observed |
| --- | --- |
| `/about` (prerendered) | 200 |
| `/this-page-does-not-exist-xyz123` | **404**, body: `The page could not be found` / `NOT_FOUND`, `x-vercel-error: NOT_FOUND` |
| `/auth` | **404** (same Vercel platform error page) |
| `/forgot-password` | **404** |
| `/reset-password` | **404** |
| `/client-portal` | **404** |
| `/admin` | **404** |

`/auth`, `/forgot-password`, `/reset-password`, `/client-portal` and `/admin` are not in `src/seo/routes.ts` `PAGES` (by design, they are auth-gated and not meant to be prerendered or indexed), and there is no `/api` directory in this repository (`find . -iname api` returns nothing), so the negative-lookahead exclusion `(?!api/)` served no purpose.

**Root cause**: Vercel's rewrite `source` matching does not reliably support a JS-style negative-lookahead regex of this shape; the rewrite was effectively inert for paths that had no literal prerendered file on disk. Because Vercel's filesystem check runs before rewrites, every route that *does* have a prerendered `dist/<route>/index.html` (every entry in `PAGES`) worked and masked the bug. Any route without a prerendered file fell through to Vercel's own platform 404 page instead of the React app.

**Impact**: this is a production-breaking bug, not only an SEO one. Supabase password-reset emails link to `/reset-password`; any user who clicked that link (a fresh navigation, not a client-side route change) landed on a bare "NOT_FOUND" page with no way to complete the reset. The same applies to `/auth` (sign-in/sign-up links shared outside the app, e.g. in emails or bookmarks), and to `/admin` or `/client-portal` opened fresh or refreshed. It also means any URL that is not in the static route table and not yet prerendered (for example a blog post slug published without a redeploy, see 4.2) returns a hard 404 instead of the SPA shell.

**Fix applied** (`vercel.json`): replaced the rewrite with the standard, documented Vercel SPA pattern:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
This is the pattern Vercel's own documentation recommends for single-page apps, uses plain path-to-regexp syntax with no lookahead, and does not change behavior for any currently-working route, because Vercel's filesystem-first matching still serves the real prerendered files directly. **This fix is only live once deployed.** It has not been pushed or deployed as part of this session; see the implementation log (`06-implementation-log.md`) and Section 9.

**Same bug, additional casualty found**: `App.tsx` defines two client-side redirects for retired product URLs, `/teevexa-desk` → `/teedesk` and `/teevexa-base` → `/` (comment: "keep old inbound links working"), using React Router's `<Navigate replace>`. Because neither path is in `PAGES` (so neither is prerendered), both are live-confirmed returning the same bare Vercel 404 instead of redirecting:
```
/teevexa-desk -> 404
/teevexa-base -> 404
```
Any existing backlink or bookmark to the old product URLs is currently dead rather than redirecting. **Additional fix applied**: added a `redirects` array to `vercel.json` with real, permanent (308) HTTP redirects for both paths, which Vercel evaluates before rewrites, independent of the prerender/rewrite fix above:
```json
"redirects": [
  { "source": "/teevexa-desk", "destination": "/teedesk", "permanent": true },
  { "source": "/teevexa-base", "destination": "/", "permanent": true }
]
```
This is a strictly better mechanism than the client-side `<Navigate>` for SEO purposes (a real HTTP redirect passes link signals more reliably than a client-side one), so the existing `<Navigate>` routes in `App.tsx` were left in place as a harmless fallback rather than removed.

### 4.2 [HIGH] No publish-triggered rebuild: prerendering and the sitemap are correct only at the moment of the last deploy

**Evidence**: `scripts/prerender.mjs` and `scripts/generate-sitemap.mjs` only run during `npm run build` (`package.json` `prebuild`/`postbuild` scripts). No deploy hook, webhook, or CI trigger fires a rebuild when a row in `blog_posts`, `case_studies` or `jobs` changes status to `published`. Searched the entire repo (`grep -rn "deploy.hook\|DEPLOY_HOOK\|vercel.com/api\|revalidate\|rebuild"`) and all Supabase edge functions: no match.

**Impact**: the moment the team publishes a new blog post, case study or job from the admin CMS, that page will not get its own prerendered static HTML and will not appear in `sitemap.xml` until the next unrelated code deploy. In the meantime (with the Section 4.1 fix deployed) the page will still *work* for a visitor and for a JS-executing crawler, via client-side Supabase fetch under the SPA shell, but it will have generic homepage-shell metadata in its raw HTML and will not be in the sitemap, which delays discovery.

**Recommended fix** (not yet implemented, needs one piece of information from you): add a Vercel Deploy Hook and call it from the admin "Publish" actions in `AdminBlog.tsx`, `AdminPortfolio.tsx` and `AdminCareers.tsx` (or at minimum, call it whenever `status` changes to `published`/`open`). This requires a Deploy Hook URL created in the Vercel project's Git settings; I cannot create one from this environment. See Section 9 and the open question list.

### 4.3 [HIGH, content/architecture] No blog posts, case studies, or job postings currently exist

**Evidence**: live query against the production Supabase REST API:
```
blog_posts:   content-range: */0   (zero rows of any status, not just zero published)
case_studies: 0 published rows
jobs:         0 open rows
```
**Impact**: this is the actual, current state of the only part of the site intended to grow over time through content (Insights/blog, Portfolio case studies, Careers). `/insights`, `/portfolio` and `/careers` currently render as empty-state listing pages. Every "audit every blog post" / "audit every case study" instruction in this engagement has nothing to audit yet; the real work here is making sure the *system* is ready the moment content exists (Sections 4.4, 4.5, and `03-keyword-and-content-map.md`). This is a content gap for the business to act on, not a code defect.

### 4.4 [MEDIUM-HIGH] Dynamic content body is not present in the prerendered HTML, only its metadata is

**Evidence**: `scripts/prerender.mjs`'s `write()` function injects `<title>`, meta tags and JSON-LD into the shared `index.html` template and a `<noscript>` fallback containing only an H1 and the description (`fallback()`, line 67-70). The actual article/case-study body (`post.content`, rendered via `renderMarkdown()` in `InsightDetail.tsx:143`) is fetched client-side from Supabase in a `useEffect` and is not written into the static HTML at all.

**Impact**: today this affects zero real pages (Section 4.3). The moment blog posts or case studies are published, a crawler or AI retrieval agent that does not execute JavaScript (several AI answer-engine crawlers fetch raw HTML without a JS runtime) will see the correct title, description and `Article` JSON-LD for a blog post, but not its body text. Googlebot itself generally does execute JavaScript, so standard Google indexing is a secondary risk here; the primary risk is AI-search/answer-engine retrieval (Phase Six of this engagement) and any JS-disabled crawler or link preview.

**Recommended fix**: extend `prerender.mjs` to also inject a server-rendered version of the article body (rendered Markdown-to-HTML, same `renderMarkdown()` used client-side) into the `<noscript>` fallback or a dedicated prerendered content block, for `blog_posts` and `case_studies`. This is a contained, well-scoped change; I will implement it as part of Phase Three/Four once there is real content to verify it against (see `09-prioritized-roadmap.md`).

### 4.5 [MEDIUM] No CMS-level SEO override fields; all dynamic-page SEO is fully derived, with no escape hatch

**Evidence**: `blog_posts` schema (`supabase/migrations/20260221091206_...sql`) has columns `title, slug, excerpt, content, cover_image_url, author_id, status, tags, published_at`. No `meta_title`, `meta_description`, `canonical_url`, `og_image_override`, or `noindex` column. `case_studies` schema (`...20260323223551_...sql`) is the same shape, no SEO fields. `AdminBlog.tsx`'s editor form (`form` state, lines 28-33, 162-228) exposes exactly: Title, Slug, Excerpt, Content, Cover Image URL, Tags, Status. No SEO fields in the UI either, so there is nothing to retrofit at the UI layer without a schema change.

**Impact**: this satisfies the "generate sensible defaults automatically" half of Phase Nine today (title/description are auto-derived from `title`/`excerpt`, which is reasonable), but not the "allow deliberate editorial overrides" half. An editor cannot shorten an overly long title for search snippets, write a meta description that differs from the excerpt, or mark an individual post `noindex` (e.g. an internal-only or outdated post) without a code change.

**Recommended fix**: add nullable `meta_title`, `meta_description`, `noindex` columns to `blog_posts` and `case_studies` (and optionally `jobs`), wire them into `InsightDetail.tsx`/`PortfolioDetail.tsx`'s `<SEO>` calls as overrides with the existing derived values as fallback, and add matching optional fields to the admin editors. This is additive and backward-compatible (existing rows get `NULL`, which falls back to current behavior). Proposed as a migration in `06-implementation-log.md`.

### 4.6 [MEDIUM] No author attribution beyond a hardcoded string

**Evidence**: `blog_posts.author_id` exists as a column, but `InsightDetail.tsx:84` passes a hardcoded literal `author="Teevexa"` to `<SEO>` rather than resolving `author_id` to a real person. No `Person` JSON-LD is emitted for any author anywhere in the codebase (confirmed: no `"@type": "Person"` string exists in `src/seo`).

**Impact**: relevant to both Phase 5.4 (author expertise) and Phase 7.2 (E-E-A-T/entity trust) of this engagement, and currently moot given zero published posts, but should be fixed before the team starts publishing so the first posts already carry real attribution rather than needing a later backfill.

### 4.7 [MEDIUM] `robots.txt` takes no explicit position on AI crawlers

**Evidence**: `public/robots.txt` is a single `User-agent: *` block with no bot-specific rules. There is no explicit `Allow`/`Disallow` for `GPTBot`, `ClaudeBot`, `Google-Extended`, `PerplexityBot`, `CCBot`, `Bytespider`, or any other named AI crawler.

**Impact**: this is not a defect; a wildcard `Allow: /` already permits every named crawler, including AI retrieval and AI training crawlers, by default. The open question is whether that is the deliberate choice (see Section 7 and `05-ai-search-strategy.md`): the business may want to allow AI *retrieval* crawlers (which can drive citation/referral traffic) while blocking AI *training* crawlers (which cannot). That is a business decision, not a technical defect, and is listed as an open question in Section 9.

### 4.8 [MEDIUM] Images: minimal use of `loading="lazy"` and explicit dimensions

**Evidence**: `grep -rn "<img" src` finds images in 14 files; `grep -rn 'loading="lazy"'` across `src` finds only 2 matches. Explicit `width`/`height` attributes on `<img>` tags were not found in the pages inspected (images are sized via Tailwind classes like `aspect-video`, `object-cover`, which constrain layout via CSS rather than intrinsic HTML attributes).

**Impact**: Tailwind's `aspect-video`/fixed-height container classes do prevent most layout shift in practice (they reserve space via CSS before the image loads), which mitigates the CLS risk somewhat, but images below the fold without `loading="lazy"` are fetched eagerly, adding to initial page weight. This is a real but moderate performance finding; see `04-technical-seo-plan.md` for remediation scope.

### 4.9 [LOW] Soft-404 behavior for unknown paths is a necessary tradeoff, not fully solved

**Evidence**: `NotFound.tsx` sets `noindex` via the client-side `<SEO>` component, but because the server-side rewrite (now fixed, Section 4.1) returns the SPA shell with an HTTP 200 for any unrecognized path, a crawler that does not execute JavaScript will see a 200 status with a generic shell before any client-side `noindex` tag applies. This is the standard tradeoff of hosting a client-rendered SPA with a catch-all rewrite on a static host; it is not unique to this project.

**Impact**: low in practice, because every genuinely valid route is prerendered with a real file (served before the rewrite ever applies) and `NotFound.tsx` does carry a `noindex` tag once JavaScript runs, which Google (a JS-executing crawler) will respect. The residual risk is JS-disabled crawlers treating a typo'd/broken URL as a 200.

**Recommended fix (future, not urgent)**: a Vercel Edge Middleware function that checks the request path against the known static route list and the dynamic-slug tables, and returns a genuine HTTP 404 for anything that matches neither, would close this gap completely. This is a larger architectural change (introduces a server-side function into an otherwise fully static deploy) and is deferred to the roadmap (`09-prioritized-roadmap.md`) rather than implemented in this pass, given its complexity relative to its current, low real-world impact.

## 5. Search engine and analytics integrations found

- **Analytics**: Plausible only (`src/lib/analytics.ts`), consent-gated behind the cookie banner (`CookieBanner.tsx`), loaded only if `VITE_PLAUSIBLE_DOMAIN` is set and the visitor has opted in. No Google Analytics 4, no Google Tag Manager, confirmed by searching the whole repo for `gtag`, `googletagmanager`, `G-` measurement IDs (no matches).
- **Google Search Console**: no verification meta tag in `index.html` and no `google*.html` verification file in `public/`. This does not mean the property is unverified; Search Console can also be verified via a DNS TXT record, which would not appear in this repository. **Could not be confirmed from the code; needs confirmation from you** (Section 9).
- **Bing Webmaster Tools**: same situation, no `BingSiteAuth.xml` or meta tag found; status unknown from the code.
- **No `llms.txt`** or similar file exists yet (Phase Six of this engagement asks me to evaluate, not assume, whether one is worth adding; see `05-ai-search-strategy.md`).

## 6. Access control and private-content exposure (Phase Eleven safety check)

- Checked that `robots.txt` disallowing `/admin/`, `/client-portal/`, `/auth`, `/forgot-password`, `/reset-password` is a **crawling courtesy, not the access-control mechanism**. The real protection is: (a) `AdminLayout.tsx`/`PortalLayout.tsx` client-side role guards, and (b) Postgres Row Level Security policies on every table reachable from the client (verified in the migrations read during this audit: `blog_posts`, `case_studies`, `jobs`, `job_applications`, `notifications`, `audit_logs`, `project_files` all have RLS enabled with policies scoped to the correct role or owner). This matches the instruction in Section 12 of the brief ("robots.txt is not being used as the sole protection for private resources") correctly.
- No secrets were found in any file intended for the client bundle or for prerendering. `scripts/seo-lib.mjs`'s `fetchRows()` only ever uses `VITE_SUPABASE_PUBLISHABLE_KEY` (the anon key, already safe to expose, restricted by RLS), never a service-role key.
- `.env` exists locally with real values and is excluded from git via `.gitignore` (confirmed present and not modified during this audit).

## 7. AI-search accessibility (Phase Six preview; full strategy in `05-ai-search-strategy.md`)

- The site already states, in clear prose and in `Organization` JSON-LD, who the company is, where it is based, what it builds, and its founder (`src/seo/site.ts`'s `globalJsonLd`, `About.tsx`). This is a reasonable foundation for entity clarity.
- FAQ content exists and is marked up (`faqLd`) on `/contact` and `/prototype-to-production` already; this is exactly the shape of content that tends to help both users and AI answer engines.
- The main gap for AI-search accessibility is the same one as for JS-disabled crawlers generally (Section 4.4): once blog content and case studies exist, their body text needs to be retrievable without executing JavaScript.
- No evidence of any content built *solely* to target AI systems (no repetitive keyword-stuffed Q&A blocks found); existing FAQ content reads as genuinely useful to a human visitor first.

## 8. Performance and accessibility notes relevant to search

- Bundle strategy: portal and admin routes are lazy-loaded (`React.lazy`, `App.tsx` lines 45-84), keeping the public bundle smaller, which is good practice for LCP/INP on the pages that actually need to rank.
- Fonts: Google Fonts loaded via `<link rel="preconnect">` plus a blocking `<link rel="stylesheet">` (`index.html` lines 13-15), not self-hosted or using `font-display` control beyond the default Google Fonts CSS. This is a plausible, minor render-blocking contributor; quantifying it requires a real Lighthouse/PageSpeed Insights run against the live site, which is a live-site measurement I have not performed in this pass (see Section 9; I did not want to claim a Core Web Vitals score without an actual tool run).
- No automated accessibility testing (axe, Lighthouse CI) found in `package.json` scripts or CI; the `/accessibility` page states WCAG 2.2 AA as a goal, which is a stated intention, not a verified, tested guarantee.

## 9. What requires live-site testing, external access, or a decision from you

I have deliberately not invented or assumed any of the following:

1. **Deploying the `vercel.json` fix** (Section 4.1). I have made the code change locally; I have not committed, pushed, or deployed it, since that is a production action. This is the single highest-priority action from this entire audit and I recommend deploying it immediately. Confirm you want me to commit/push, or do so yourself.
2. **A Vercel Deploy Hook URL** for triggering a rebuild on publish (Section 4.2). I cannot create this from the local environment; it is created in the Vercel project's dashboard (Settings → Git → Deploy Hooks). Once you provide the URL (or confirm you'll add it as an environment variable), I can wire the admin "Publish" actions to call it.
3. **Google Search Console and Bing Webmaster Tools verification status** (Section 5): unknown from the code. Please confirm whether either is already set up (and how: DNS, meta tag, or file) so the measurement plan in `08-seo-maintenance-guide.md` reflects reality rather than assuming a fresh setup.
4. **Whether Google Analytics 4 should be added alongside or instead of Plausible.** The current site deliberately uses only consent-gated, cookieless Plausible analytics; adding GA4 is a business/privacy decision, not something I will do unilaterally.
5. **AI crawler policy** (Section 4.7): whether to explicitly allow AI retrieval crawlers (e.g. for citation/referral potential) while blocking AI training crawlers (e.g. `CCBot`, `GPTBot` when used for training rather than browsing), stay fully open, or block AI crawlers entirely. Addressed with options and tradeoffs in `05-ai-search-strategy.md`, but the final choice is yours.
6. **Any existing backlink, impression, click, or ranking data** (Search Console, Bing Webmaster Tools, any third-party rank tracker). I have no access to these and have not fabricated any baseline numbers. The measurement plan (`08-seo-maintenance-guide.md`) defines what to track going forward rather than claiming any existing performance.
7. **Real Lighthouse/PageSpeed/Core Web Vitals measurements against the live production site.** Not yet run in this pass; flagged in `04-technical-seo-plan.md` as a to-do with the exact command/tool to use, rather than estimated.
8. **Whether `teevexa.com` (apex) correctly redirects to `www.teevexa.com`** (canonical host consistency) or vice versa. DNS/domain configuration in Vercel, outside this repository; needs a live check or your confirmation.

## 10. Summary of findings by severity

| # | Severity | Finding | Status |
| --- | --- | --- | --- |
| 1 | Critical | SPA rewrite broken: password reset, auth, admin, portal all return bare 404 in production | **Fixed locally in `vercel.json`; not yet deployed** |
| 1b | High | Retired-URL redirects (`/teevexa-desk`, `/teevexa-base`) were dead 404s instead of redirecting, same root cause | **Fixed locally with real HTTP 301/308 redirects; not yet deployed** |
| 2 | High | No publish-triggered rebuild; dynamic content invisible to sitemap/prerender until next deploy | Open; needs a Deploy Hook URL from you |
| 3 | High | Zero blog posts/case studies/jobs exist; content pipeline is empty | Business/content gap, not a code defect |
| 4 | Medium-High | Dynamic content body not present in prerendered HTML, metadata-only | Open; scoped fix identified |
| 5 | Medium | No CMS-level SEO override fields on `blog_posts`/`case_studies` | Open; migration + UI change scoped |
| 6 | Medium | No real author attribution, hardcoded "Teevexa" string | Open |
| 7 | Medium | `robots.txt` has no explicit AI-crawler stance (currently defaults to allow-all) | Needs your decision |
| 8 | Medium | Minimal `loading="lazy"`/explicit image dimensions | Open |
| 9 | Low | Soft-404 for unknown paths under the (now-fixed) SPA rewrite | Accepted tradeoff; documented future fix |

Continued in `02-url-inventory.md` (complete URL inventory), `03-keyword-and-content-map.md`, `04-technical-seo-plan.md`, `05-ai-search-strategy.md`, `06-implementation-log.md`, `07-validation-report.md`, `08-seo-maintenance-guide.md`, and `09-prioritized-roadmap.md`.
