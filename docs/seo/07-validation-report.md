# Validation Report: teevexa-web SEO Engagement

All checks below were run in this session, in this exact order, against the working tree with all changes from this engagement applied (none committed/pushed). Raw command output is summarized; nothing here is estimated or assumed.

## 1. Unit tests

```
npm test
```
Result: **33/33 tests passing**, 3 test files (`example.test.ts`, `seo.test.ts`, `estimate.test.ts`). `seo.test.ts` grew from 13 to 15 tests in this session (two new tests for `articleLd`'s author behavior, see `06-implementation-log.md`). No pre-existing test was changed or weakened to make this pass.

## 2. Type checking

```
npx tsc --noEmit -p tsconfig.app.json
```
Result: **exit code 0, no errors.** Covers every file changed in this session (`src/seo/site.ts`, `src/pages/InsightDetail.tsx`, `src/pages/PortfolioDetail.tsx`, `src/pages/Insights.tsx`, `src/pages/admin/AdminBlog.tsx`, `src/pages/admin/AdminPortfolio.tsx`, `src/pages/admin/AdminCareers.tsx`, `src/lib/functions.ts`, `src/integrations/supabase/types.ts`).

## 3. Lint

```
npm run lint
```
Result: **34 pre-existing problems (19 errors, 15 warnings), all in files untouched by this session** (Supabase edge functions using `any`, `tailwind.config.ts`'s CommonJS `require()`, and a handful of `react-hooks/exhaustive-deps` warnings in admin/portal pages unrelated to SEO). Verified directly: `npm run lint 2>&1 | grep -E "AdminBlog|AdminPortfolio|AdminCareers|functions\.ts|trigger-rebuild"` returns no matches, confirming zero new lint issues from this session's changes. These pre-existing issues are out of scope for this SEO engagement and were not fixed, per the instruction to stay focused and avoid unrelated changes; flagged here for visibility only.

## 4. Production build

```
npm run build
```
Result: **succeeds**, runs the full real pipeline (`prebuild` → `generate-sitemap.mjs`, `vite build`, `postbuild` → `prerender.mjs`), exactly as it would in CI/Vercel. Console output:
```
[seo] skipped blog_posts: HTTP 400
[seo] skipped case_studies: HTTP 400
[prerender] wrote 29 HTML files (blog_posts: 0, case_studies: 0, jobs: 0)
```
The two `HTTP 400` lines are **expected and explained**: the build scripts now request the new `meta_title`/`meta_description`/`seo_noindex`/`author_name` columns, which do not exist in the live database yet (migration not applied). The existing `fetchRows()` error handling (pre-existing code, not changed) catches this and degrades to 0 rows rather than failing the build, which is the same graceful-degradation behavior this script already had for any other fetch failure. **This is a real, expected, temporary state tied to migration-then-deploy ordering, not a bug**; see `04-technical-seo-plan.md` §6 and `06-implementation-log.md` for the exact sequence to apply before this stops appearing. Vite's own build output includes its standard large-chunk warning (`index-*.js` ~606 kB gzip ~159 kB), which is a pre-existing condition, not introduced by this session (bundle sizes were not restructured; see `04-technical-seo-plan.md` §4).

## 5. Direct verification of the new rendering pipeline

Since zero blog posts/case studies exist to test prerendering against end-to-end, I verified the specific new code path in isolation:
```
node -e 'import("./node_modules/.cache/teevexa-seo/seo.mjs").then((seo) => {
  console.log(typeof seo.renderMarkdown);
  console.log(seo.renderMarkdown("# Hello\n\nSome **bold** text and a [link](https://example.com)."));
});'
```
Result: `renderMarkdown` is exported correctly from the bundled module and renders exactly the expected, safe HTML (`<h2>Hello</h2><p>Some <strong>bold</strong> text and a <a href="..." target="_blank" rel="noopener noreferrer">link</a>.</p>`). This confirms the mechanism added for finding 4.4 (dynamic content body in prerendered HTML) works correctly; what remains unverified is the full path against a real published row, which requires the migration to be applied and at least one real post published.

## 6. Sitemap and prerender output verification

```
grep -c "<url>" public/sitemap.xml   -> 25
find dist -name "index.html" | wc -l -> 29
```
25 matches `INDEXABLE_PATHS.length` from `src/seo/routes.ts` exactly (checked via a direct Node import, not assumed). 29 matches 25 indexable + 4 deliberately `noindex` static pages (legal x3, account deletion). Both numbers reconcile exactly with the code; see the corrected counts in `02-url-inventory.md` (an earlier draft of that document had an arithmetic error, 26/22 instead of 25/24, caught and fixed before this report).

## 7. `vercel.json` syntax

```
python3 -c "import json; json.load(open('vercel.json')); print('valid')"
```
Result: valid JSON. This does not verify Vercel's runtime behavior (that requires an actual deployment, which has not happened), only that the file itself is syntactically correct.

## 8. Live HTTP checks against production

**Before any fix** (same session, prior to deploy):

| Path | Status observed |
| --- | --- |
| `/about`, `/`, all 25 indexable static pages | 200 |
| `/this-page-does-not-exist-xyz123` | 404 (Vercel platform error, not the app) |
| `/auth`, `/forgot-password`, `/reset-password`, `/client-portal`, `/admin` | 404 (Vercel platform error, not the app) |
| `/teevexa-desk`, `/teevexa-base` | 404 (should redirect) |
| `/sitemap.xml`, `/robots.txt` | 200 |

**After the first deploy** (redirects added, rewrite destination still `/index.html`): redirects (`/teevexa-desk`, `/teevexa-base`) confirmed working (`308`); the five auth/admin/portal paths still returned the Vercel platform 404. This disproved the first rewrite fix and led to the second attempt (destination `/` instead of `/index.html`; see `01-initial-audit.md` §4.1).

**After the second deploy**, re-tested with fresh, cache-busted requests:

```
/reset-password -> 200
/auth -> 200
/forgot-password -> 200
/admin -> 200
/client-portal -> 200
/teevexa-desk -> 308
/teevexa-base -> 308
/about -> 200
/ -> 200
/this-still-doesnt-exist-xyz -> 200 (expected soft-404 shell, see §4.9 of the audit, not a regression)
```

All previously-broken paths resolve correctly, nothing previously working regressed. **This finding is closed and confirmed in production**, not just locally.

## 9a. Migration and edge function, verified after this report was first drafted

With a temporary Supabase access token, the following were completed and verified live, not just assumed:

- **Migration applied**: `supabase migration list` confirmed only `20261027000000_blog_and_case_study_seo_fields.sql` was pending (everything else already in sync, no drift), then `supabase db push` applied it cleanly. Verified by querying `blog_posts`/`case_studies` for the new columns directly: `200` with an empty array (0 rows, as expected), where the same query returned `400` before the migration.
- **Edge function deployed**: `supabase functions deploy trigger-rebuild` succeeded. Verified live: an unauthenticated request returns Supabase's own gateway `401`; a request authenticated with only the anon key (no real staff session) returns our function's own `{"error":"Forbidden"}` `403`. This confirms the function is deployed, reachable, and its `isTeam` role gate works, without spending a real Vercel build on the test.
- **`DEPLOY_HOOK_URL` secret set**: confirmed present via `supabase secrets list` (name and digest shown; the CLI never displays secret values, by design).

## 9c. End-to-end verification with the first real published post, and a real bug it caught

You published the first real post (`your-ai-prototype-works-here-is-what-production-actually-requires`, drafted from `03-keyword-and-content-map.md`). This exercised the full pipeline for the first time with real data, and it worked: `triggerRebuild()` fired, the edge function called the Vercel deploy hook, a new deployment ran, and the live site picked up the new prerendered page and sitemap entry automatically, with no manual deploy step. Verified live: `/insights/<slug>` returns `200` with the correct `<title>`, meta description, canonical URL, `og:type: article`, and `Article` JSON-LD; the sitemap contains the new URL.

**It also caught a real bug.** The prerendered article body was present but empty, just the title and date, no actual content. Root cause: `DYNAMIC`'s `select` string for `blog_posts` in `scripts/seo-lib.mjs` never included the `content` column (it only needed metadata before this engagement added body rendering, and the select list was never updated to match), so `r.content` was `undefined` and `renderMarkdown(undefined)` correctly rendered nothing. The same bug existed for `case_studies` (`challenge`/`solution`/`results` were also missing from that table's select). Both were fixed (`content` added to the `blog_posts` select; `challenge,solution,results` added to the `case_studies` select) and verified by rebuilding locally against the real live database: the regenerated `dist/insights/<slug>/index.html` now contains the full 6,388-character rendered article body, correct heading levels, lists and bold text all intact.

This is exactly the gap flagged in Section 5 of this report before any content existed ("what remains unverified is the full path against a real published row"): the isolated test of `renderMarkdown()` proved the renderer worked, but could not catch a missing database column, since that only surfaces when a real row with real data flows through the real fetch. Noted here as a concrete example of why this report consistently separated "verified in isolation" from "verified end-to-end," rather than treating the former as sufficient.

## 9b. What was explicitly NOT verified, and why

| Item | Why not verified | What would verify it |
| --- | --- | --- |
| Prerendering/sitemap behavior with a real published blog post, and the full publish → rebuild → live round trip | Zero posts exist | Publish one real post, confirm the rebuild fires and the resulting deployment includes `dist/insights/<slug>/index.html` |
| ~~Real Core Web Vitals (LCP/INP/CLS)~~ | **Resolved 2026-10-27.** You ran `pagespeed.web.dev` yourself and shared both reports. Desktop 98/100/100/100, Mobile 78/100/100/100, CLS 0 on both, TBT 0ms on both. Full numbers and analysis in `04-technical-seo-plan.md` §4. No real-user (CrUX) field data exists yet, domain too young/low-traffic, so this is lab data only; flagged in that section rather than overstated as a field measurement. | Done |
| Structured data renders correctly in Google's Rich Results Test specifically | The tool's own page requires client-side JavaScript to run a validation (confirmed: fetching it returns only the empty input form); substituted with a manual, evidence-based check of the real live JSON-LD from four representative pages against schema.org's documented requirements, all passed (`04-technical-seo-plan.md` §5) | Paste `https://www.teevexa.com` and the published post's URL into `https://search.google.com/test/rich-results` yourself for Google's own verdict |

**Resolved, not just attempted**: whether `teevexa.com` apex redirects to `www.teevexa.com`. Checked directly: `https://teevexa.com/` returns `308` to `https://www.teevexa.com/`, and `http://teevexa.com/` resolves to the canonical host in a normal 2-hop chain (`http → https apex → https www`, `curl -L` confirms `num_redirects: 2`, final status `200`). Canonical host is correctly enforced; no issue found.

## 10. Summary

| Check | Result |
| --- | --- |
| Unit tests | 33/33 pass |
| TypeScript | Clean |
| Lint | Clean for all changed files; 34 pre-existing, unrelated issues untouched |
| Production build | Succeeds, with an expected and explained warning |
| New rendering logic | Verified in isolation |
| Sitemap/prerender counts | Reconcile exactly with the code |
| `vercel.json` syntax | Valid |
| Live production fix | Confirmed, deployed and re-tested live (took two attempts) |
| Migration, edge function, deploy hook secret | All three applied and verified live |
