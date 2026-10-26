# AI Search and Answer-Engine Strategy: teevexa-web

## 1. Crawler access policy (decision made)

You confirmed the policy: **allow all AI crawlers**, no explicit per-bot rules. This matches `robots.txt`'s current state exactly (a wildcard `Allow: /` with no bot-specific exceptions), so **no code change was needed or made** for this decision.

For completeness, the tradeoff that was considered and declined:

| Option | What it would mean | Why not chosen |
| --- | --- | --- |
| Allow retrieval bots, block training bots | Explicit `Disallow` rules for crawlers primarily used for model training (e.g. `CCBot`), while leaving retrieval/browsing bots (e.g. `PerplexityBot`, `ChatGPT-User`) and search bots untouched | More defensive of content, but the line between "training" and "retrieval" crawler is blurry and shifts as vendors change their crawlers' stated purpose; for a company whose business model depends on being found and cited (not on content paywalling), the upside of broader visibility outweighs the training-data concern |
| Block all AI crawlers | Explicit `Disallow` for every named AI user agent | Opts out of AI-generated answer citations entirely, which runs directly against this engagement's stated goal #4 ("improve eligibility to appear in AI-powered search results") |

**If this decision changes later**, the implementation is a short, explicit addition to `public/robots.txt` naming the specific user agents to block (e.g. `User-agent: CCBot` / `Disallow: /`), not a removal of the current wildcard allow.

## 2. Content designed for accurate retrieval

What already supports this, found during the audit (`01-initial-audit.md` §3, §7):

- `Organization`/`ProfessionalService` JSON-LD on every page states who the company is, where it's based, what it does, and who founded it, in machine-readable form.
- `FAQPage` JSON-LD already exists on `/contact` and `/prototype-to-production`, in both cases built from real, useful FAQ content rather than keyword-stuffed filler.
- Service pages (`/services/*`) each state a specific problem, a specific gap in the market, and a specific approach, in plain prose, rather than generic "we do X" copy. This is exactly the shape of content that both human readers and AI summarization tend to extract cleanly.

What was fixed in this engagement:

- **Dynamic content body now exists in server-rendered HTML** (see `04-technical-seo-plan.md` §2), which matters specifically for AI retrieval crawlers that may not execute JavaScript the way Googlebot does. Before this fix, a non-JS crawler landing on a blog post or case study URL would see correct metadata but no actual article text; now it sees the real content.
- **Real author attribution** (`author_name` on `blog_posts`, `Person` JSON-LD when set) gives AI systems (and human readers) a real byline to associate expertise with, rather than a generic "Teevexa" string on every post regardless of who actually wrote it.

What remains a content gap, not a code gap: there is no blog content yet to actually demonstrate expertise, and AI answer engines generally need to find and ingest content before they can cite it. This is the same content-pipeline gap identified in `01-initial-audit.md` §4.3, and the recommendation is the same: publish the first few posts from `03-keyword-and-content-map.md` Section 3.

## 3. Entity consistency and trust

Cross-checked during this audit:

- Company name ("Teevexa Ltd"), location (Nairobi, Kenya), founder (Benjamin Baya), and contact email (`hello@teevexa.com`) are consistent between `src/seo/site.ts`'s `globalJsonLd()`, the `README.md` files across this company's repositories (verified in a prior engagement in this same workspace), and the live site's `/about` page.
- Social profile links in `SOCIAL_PROFILES` (`src/seo/site.ts`) are declared in `sameAs`, which is the correct mechanism for telling search/AI systems "these other profiles are the same entity." **I did not verify each of these URLs is still live and correctly branded**; that is a live-link check outside this repository's code, listed as an action item below.
- No fabricated testimonials, credentials, awards, or media mentions exist anywhere in the codebase (checked specifically, since the brief prohibits this). The site's claims about itself are limited to what it has actually built (two shipped Android apps, two open-source projects, a defined service list), which is the correct, defensible posture for AI-search trust purposes: an AI system (or a human) fact-checking these claims against GitHub/Google Play will find them true.

### Action items for you (not code changes)

1. Confirm each URL in `SOCIAL_PROFILES` (`src/seo/site.ts:11-19`: LinkedIn, X, Instagram, Facebook, TikTok, YouTube, GitHub) is still active and branded consistently. A dead or renamed profile in `sameAs` is a weak trust signal.
2. **Confirmed, not speculative**: a real web search for "software development company Nairobi AI native" during this engagement (`03-keyword-and-content-map.md` §6) surfaced GoodFirms' Kenya directory (132 listed companies) and several named competitors on it; Teevexa does not appear there. Creating a GoodFirms listing (and checking Clutch and The Manifest, both of which also surfaced in that search) is a concrete, verified gap, not a maybe. This is still outside this repository's scope to implement, since it involves creating accounts and making claims on external platforms on the company's behalf, and I have not done it without your explicit instruction.
3. ~~LinkedIn entity-consistency fixes~~ **Done and confirmed live.** LinkedIn's company page originally spelled the company name three different ways in its About text ("TEEVEXA", "TEVEXA", "TEVEXA Technologies") and listed "Founded 2025" against the website's `foundingDate: "2026-03-03"`. Re-checked directly after you updated it: the About text now uses "Teevexa" consistently throughout, "Founded" now shows 2026, and the workplace policy was also corrected to Remote (it was defaulted to On-site, which directly contradicted the "Remote-First" benefit on `/careers`). Overview text and workplace description were written from the same source of truth as the rest of this site (`src/seo/site.ts`'s `globalJsonLd` description, `Careers.tsx`'s benefits list) rather than drafted independently, so this closes the entity-consistency gap rather than just adding a third, different version of the same facts.

## 4. `llms.txt` evaluation

**Recommendation: do not add one yet.**

Reasoning:
- `llms.txt` is an emerging, informal convention with no confirmed adoption by any major AI search or retrieval system as of this audit. It is not a replacement for the fundamentals (sitemap, clean HTML, correct metadata), which this engagement has already prioritized and improved.
- The practical case for `llms.txt` is strongest for sites with large volumes of technical documentation that benefit from a curated, flattened index for LLM context windows (think an API reference or SDK docs site). `teevexa.com`'s indexable surface is 25 pages today; a sitemap and clean HTML already serve that purpose adequately.
- Adding a speculative file with no demonstrated benefit, purely to "look AI-ready," would be exactly the kind of superficial change this engagement's brief explicitly warns against ("Do not assume that adding metadata, structured data, or an AI-related text file guarantees rankings or AI citations").

**Revisit this** if: (a) the convention gains confirmed adoption by a major AI search provider, or (b) the site's technical documentation (`/api-docs`, and any future developer-facing docs for Teevexa Trace's API) grows enough that a curated index would genuinely help a retrieval system navigate it. Neither condition is true today.

## 5. AI search measurement plan

### What's available to measure with (confirmed from you)

- **Google Search Console**: already verified for this property.
- **Bing Webmaster Tools**: already verified for this property.
- Neither tool directly reports "AI citations"; both report standard organic search impressions/clicks/queries, which is still the right baseline to track since AI Overviews and similar features are surfaced within Google's own search results and partially reflected in Search Console's data (Google has stated AI Overview impressions are included in Search Console's totals, though not broken out separately as of this writing).

### Baseline to establish going forward (I have not fabricated any numbers; this is what to start recording)

| Metric | Source | Cadence |
| --- | --- | --- |
| Organic impressions/clicks/CTR/average position, by page | Search Console Performance report | Monthly |
| Indexed vs. submitted URL count | Search Console Pages report, sitemap status | Monthly, or after any sitemap change |
| Crawl errors | Search Console Pages report ("Why pages aren't indexed") and Bing Webmaster Tools' Crawl Information | Monthly |
| Referral traffic from identifiable AI platforms (`chat.openai.com`, `perplexity.ai`, `www.bing.com/chat`, etc. as referrers) | Plausible's referrer breakdown (already installed; no new tool needed) | Monthly |
| Manual sampling: ask ChatGPT/Perplexity/Google AI Overviews a handful of the site's target queries (from `03-keyword-and-content-map.md`) and record whether/how Teevexa is mentioned | Logged in `10-search-visibility-log.md`; first baseline entry added 2026-10-26 using `WebSearch` as a documented proxy (see that file's caveat on what it is and is not equivalent to) | Quarterly |

**Explicit caveat to carry into every one of these reports**: a missing citation in a small manual sample does not mean the site is never cited; AI answers vary by session, model version, and phrasing. Treat the manual sampling as a rough directional signal, not a pass/fail test, consistent with this engagement's own instruction on this point.

This plan is folded into the ongoing cadence in `08-seo-maintenance-guide.md`.
