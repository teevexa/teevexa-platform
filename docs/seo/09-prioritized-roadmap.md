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
| ~~Publish the first blog post~~ | **Done.** Published, pipeline verified end to end, caught and fixed a real content-rendering bug along the way. Two more drafted (offline-first mobile architecture, regional payment gateways), ready for you to review and publish the same way. | `03-keyword-and-content-map.md`, `07-validation-report.md` §9c |
| ~~Run PageSpeed Insights; record real LCP/INP/CLS numbers~~ | **Done.** Desktop 98/100/100/100, Mobile 78/100/100/100, CLS 0, TBT 0ms. Surfaced two real, scoped follow-ups: self-host fonts (proposed, awaiting go-ahead) and `llms.txt` (added, see below). Confirmed the "unused JavaScript" flag was not Recharts leaking into the public bundle, a real but different, lower-priority finding instead. | `04-technical-seo-plan.md` §4 |
| ~~Add `llms.txt`~~ | **Reversed from the original "wait" call, with real new evidence.** Lighthouse's new Agentic Browsing category now checks for one directly. Added `public/llms.txt`, built from already-verified facts. | `05-ai-search-strategy.md` §4 |
| Self-host fonts | No longer gated on missing data, the PageSpeed run justified it (160-750ms render-blocking). Proposed, not yet implemented, awaiting your go-ahead since it touches every page. | `04-technical-seo-plan.md` §4 |
| Submit a couple of URLs to Google's Rich Results Test | **Substituted with a manual, evidence-based validation** of the real live JSON-LD against schema.org's requirements (all passed); Google's own tool needs a JS session I don't have. See `04-technical-seo-plan.md` §5. | `07-validation-report.md` §9 |
| ~~Confirm `teevexa.com` (apex) correctly redirects to `www.teevexa.com`~~ | **Done, confirmed correct.** `308` to the canonical host, normal 2-hop chain. No issue found. | `07-validation-report.md` §9 |
| ~~Audit the `SOCIAL_PROFILES` links for liveness/branding consistency~~ | **Done, including the fix.** All seven resolve to real, correctly-branded Teevexa profiles. Found and fixed two real issues on LinkedIn: inconsistent name spelling and a wrong founding year; also corrected the workplace policy there to Remote, which the page had defaulted to On-site despite the site's own "Remote-First" claim. Confirmed live after the fix. | `05-ai-search-strategy.md` §3 |
| Reconcile `03-keyword-and-content-map.md`'s keyword hypotheses against real Search Console query data | Still needs you: Search Console's own query data, not something I can pull without API/OAuth access I don't have in this environment. Partially substituted with three real `WebSearch` baseline checks, which already corrected one hypothesis (`03-keyword-and-content-map.md` §5-6) and surfaced a concrete directory-listing gap (GoodFirms, `05-ai-search-strategy.md` §3). | `03-keyword-and-content-map.md` §6 |
| ~~Give `/prototype-to-production` more prominent internal linking~~ | **Withdrawn.** On inspection, a dedicated homepage section already exists (`Index.tsx` lines 182-208) with its own headline, bullets and two CTAs; the earlier recommendation was based on checking `Navbar.tsx` alone and not catching this. See `03-keyword-and-content-map.md` §4 for the correction. | `03-keyword-and-content-map.md` §4 |

## Medium-term (this quarter)

| Item | Why | Reference |
| --- | --- | --- |
| ~~Establish a steady publishing cadence~~ | **On track.** All four originally-identified posts are now published or drafted (3 live, 1 handed over for review); two more genuinely-grounded topics identified for after those land, deliberately not a longer list, to avoid padding. | `03-keyword-and-content-map.md` §3 |
| ~~Begin the quarterly manual AI-answer spot check~~ | **Started, and already corrected once.** First baseline entry logged in `10-search-visibility-log.md` (2026-10-26) initially showed zero visibility everywhere checked via `WebSearch`, including the bare brand name. A real Google search the same day (screenshot) showed the opposite: Teevexa ranks first for its own name, with an accurate AI Overview. The log now documents that the search tool used for this baseline does not reliably reflect Google's real results, which is itself a useful finding for how future quarterly checks should be run. Next entry due ~2027-01. | `10-search-visibility-log.md` |
| ~~Consider self-hosting fonts~~ | Moved to Short-term above now that real data justifies it. | `04-technical-seo-plan.md` §4 |
| Consider route-splitting the public pages the way admin/portal already are | Real, measured cause of the "unused JavaScript" flag (not Recharts, which was checked and confirmed already properly isolated). Genuine trade-off: today's instant public-page navigation vs. a brief first-visit flicker if split. Scores are already strong (98/78), so this is optional, not urgent; needs your call on whether the trade-off is worth it. | `04-technical-seo-plan.md` §4 |

## Longer-term / revisit-if-conditions-change

| Item | Trigger that would make this worth doing | Reference |
| --- | --- | --- |
| Edge Middleware for true HTTP 404s on unknown paths | If the soft-404 tradeoff starts measurably hurting (e.g. Search Console flags a meaningful number of low-quality/soft-404 pages as indexed) | `01-initial-audit.md` §4.9 |
| `llms.txt` | If a major AI search/retrieval provider confirms adoption, or `/api-docs` grows into a much larger developer-documentation surface | `05-ai-search-strategy.md` §4 |
| Sitemap segmentation (multiple sitemap files + a sitemap index) | If total indexable URLs approach the tens of thousands (not expected for years at current content velocity) | `04-technical-seo-plan.md` §1 |
| Enterprise SAML-style AI crawler policy changes (blocking specific training bots) | If the business's position on AI training data changes from the "allow all" decision made in this engagement | `05-ai-search-strategy.md` §1 |

## What this roadmap deliberately excludes

Per this engagement's explicit rules, this roadmap does not include: location pages for markets Teevexa doesn't serve, a backlink-building campaign (outside this repository's scope and easily done badly), fabricated reviews/ratings/case-study metrics, or a volume target for blog posts disconnected from the quality/linking discipline in `03-keyword-and-content-map.md`. "Publish more content" is not on this roadmap as a standalone item; "publish content that supports a specific existing page" is.
