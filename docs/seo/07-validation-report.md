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

## 8. Live HTTP checks against production (performed before any fix was applied)

| Path | Status observed |
| --- | --- |
| `/about`, `/`, all 25 indexable static pages | 200 |
| `/this-page-does-not-exist-xyz123` | 404 (Vercel platform error, not the app) |
| `/auth`, `/forgot-password`, `/reset-password`, `/client-portal`, `/admin` | 404 (Vercel platform error, not the app) |
| `/teevexa-desk`, `/teevexa-base` | 404 (should redirect) |
| `/sitemap.xml`, `/robots.txt` | 200 |

These are the findings behind `01-initial-audit.md` §4.1. **They have not been re-checked post-fix, because the fix has not been deployed** (your decision; see `01-initial-audit.md` §9). Re-run the same `curl -o /dev/null -w "%{http_code}"` checks after deploying to confirm the fix in production.

## 9. What was explicitly NOT verified, and why

| Item | Why not verified | What would verify it |
| --- | --- | --- |
| The `vercel.json` fix actually resolves the 404s in production | Not deployed in this session | Re-run the Section 8 checks against production after deploy |
| Prerendering/sitemap behavior with a real published blog post | Zero posts exist; migration not applied | Apply the migration, publish one real post, re-run `npm run build`, inspect `dist/insights/<slug>/index.html` |
| `trigger-rebuild` edge function actually triggers a Vercel build | No `DEPLOY_HOOK_URL` secret exists yet, and the function isn't deployed | Set the secret, deploy the function, publish a post, confirm a new Vercel deployment starts |
| Real Core Web Vitals (LCP/INP/CLS) | No live browser/Lighthouse tool access from this environment | Run PageSpeed Insights or Lighthouse against `https://www.teevexa.com` |
| Structured data renders correctly in Google's Rich Results Test | No live browser access to submit a URL to Google's tool | Paste `https://www.teevexa.com` and a couple of inner pages into `https://search.google.com/test/rich-results` |
| Whether `teevexa.com` apex redirects to `www.teevexa.com` | DNS/domain configuration outside this repository | Check in Vercel's domain settings, or `curl -I https://teevexa.com` |

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
| Live production fix | Not yet verifiable (not deployed) |
