# Prioritized Roadmap: teevexa-web SEO

Every item below is cross-referenced to where it's explained in full. Severity/priority follows `01-initial-audit.md`'s classification.

## Immediate (this week)

| Item | Why now | Reference |
| --- | --- | --- |
| ~~Deploy the `vercel.json` fix~~ | **Done.** Confirmed live: password reset, auth, admin, portal and the two retired-URL redirects all resolve correctly in production as of this writing | `01-initial-audit.md` §4.1, `07-validation-report.md` §8 |
| ~~Apply the `blog_and_case_study_seo_fields` migration~~ | **Done.** Applied and verified live | `06-implementation-log.md`, `07-validation-report.md` §9a |
| ~~Create the Vercel Deploy Hook and set `DEPLOY_HOOK_URL`~~ | **Done.** | Same |
| ~~Deploy the `trigger-rebuild` edge function~~ | **Done.** Deployed and verified live (role gate confirmed working) | Same |

All four immediate items from this engagement are now complete. The only thing left in this bucket is end-to-end verification once real content is published (see Short-term, below).

## Short-term (this month)

| Item | Why | Reference |
| --- | --- | --- |
| Publish the first 2-3 blog posts, chosen from `03-keyword-and-content-map.md` §3, each linking to the static page it supports | The single biggest lever available: right now the "content marketing" half of this engagement has nothing to work with | `03-keyword-and-content-map.md` |
| Run PageSpeed Insights against the homepage and 2-3 inner pages; record real LCP/INP/CLS numbers | No real Core Web Vitals baseline exists yet; needed before claiming any performance improvement | `04-technical-seo-plan.md` §4, `07-validation-report.md` §9 |
| Submit a couple of URLs to Google's Rich Results Test to confirm the structured data renders as expected in Google's own tooling | Haven't been able to verify this from this environment | `07-validation-report.md` §9 |
| Confirm `teevexa.com` (apex) correctly redirects to `www.teevexa.com` | Canonical host consistency; a 2-minute DNS/Vercel domain check | `01-initial-audit.md` §9 |
| Audit the `SOCIAL_PROFILES` links for liveness/branding consistency | Entity trust signal; a 10-minute manual check | `05-ai-search-strategy.md` §3 |
| Reconcile `03-keyword-and-content-map.md`'s keyword hypotheses against real Search Console query data, now that GSC access is confirmed | Replace guesses with real data where it exists | `03-keyword-and-content-map.md` (caveat at top) |
| Give `/prototype-to-production` more prominent internal linking (homepage section, not just a services sub-link) | Highest-leverage, lowest-cost content opportunity identified in this engagement | `03-keyword-and-content-map.md` §5 |

## Medium-term (this quarter)

| Item | Why | Reference |
| --- | --- | --- |
| Establish a steady publishing cadence for blog content, following the two-way internal-linking discipline (every post names the page it supports) | Content compounds; a single burst of posts followed by silence is weaker than steady, linked output | `03-keyword-and-content-map.md` §3-4 |
| Begin the quarterly manual AI-answer spot check | Starts building a real history of AI-search visibility rather than a one-time snapshot | `05-ai-search-strategy.md` §5, `08-seo-maintenance-guide.md` §7 |
| Consider self-hosting fonts if the PageSpeed numbers from the short-term item above show it matters | Don't guess; decide from the measured baseline | `04-technical-seo-plan.md` §4 |
| Consider a frontend bundle-splitting pass if real-user performance data shows it matters | Same: decide from measurement, not assumption | `04-technical-seo-plan.md` §4 |

## Longer-term / revisit-if-conditions-change

| Item | Trigger that would make this worth doing | Reference |
| --- | --- | --- |
| Edge Middleware for true HTTP 404s on unknown paths | If the soft-404 tradeoff starts measurably hurting (e.g. Search Console flags a meaningful number of low-quality/soft-404 pages as indexed) | `01-initial-audit.md` §4.9 |
| `llms.txt` | If a major AI search/retrieval provider confirms adoption, or `/api-docs` grows into a much larger developer-documentation surface | `05-ai-search-strategy.md` §4 |
| Sitemap segmentation (multiple sitemap files + a sitemap index) | If total indexable URLs approach the tens of thousands (not expected for years at current content velocity) | `04-technical-seo-plan.md` §1 |
| Enterprise SAML-style AI crawler policy changes (blocking specific training bots) | If the business's position on AI training data changes from the "allow all" decision made in this engagement | `05-ai-search-strategy.md` §1 |

## What this roadmap deliberately excludes

Per this engagement's explicit rules, this roadmap does not include: location pages for markets Teevexa doesn't serve, a backlink-building campaign (outside this repository's scope and easily done badly), fabricated reviews/ratings/case-study metrics, or a volume target for blog posts disconnected from the quality/linking discipline in `03-keyword-and-content-map.md`. "Publish more content" is not on this roadmap as a standalone item; "publish content that supports a specific existing page" is.
