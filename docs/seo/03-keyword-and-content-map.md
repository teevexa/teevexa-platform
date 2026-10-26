# Keyword and Content Map: teevexa-web

**Important caveat, read first**: this document does not use Google Keyword Planner, Ahrefs, Semrush, Search Console query data, or any other real search-volume tool. I have no access to any of those in this environment. Every keyword listed below is a **hypothesis derived from the business's own service/product descriptions and plain reasoning about user intent**, not a validated, measured opportunity. Where Search Console data becomes available (it is already verified for this property, per your confirmation), the real next step is to replace this document's guesses with the Queries report for each page and re-prioritize from there. That reconciliation is listed as an action item in `09-prioritized-roadmap.md`.

## 1. How the site's intent map breaks down

| Intent | Pages | Notes |
| --- | --- | --- |
| Navigational/branded | `/`, `/about`, `/contact` | Someone already knows Teevexa and wants to find/reach it |
| Commercial investigation (service) | `/services/*`, `/teevexa-trace`, `/teevexa-field`, `/pricing` | Someone comparing software development partners or evaluating the two Android products |
| Highest commercial intent, differentiated | `/prototype-to-production` | The single most distinctive page on the site: "I built something with an AI tool and need it made real" is a genuinely narrow, well-defined intent with little generic competition |
| Transactional | `/start-project`, `/book-consultation` | Ready to act |
| Informational | `/insights` (and future posts), `/open-source`, `/teedesk`, `/cyberguard-ai`, `/api-docs` | Research-stage or developer-audience content |
| Recruiting | `/careers` (and future job postings) | Candidate-side intent, a different audience from the rest of the site |
| Utility | `/verify` | Not a marketing page at all: someone with a physical product in hand checking its provenance |

## 2. Per-page keyword hypotheses (static pages)

| Page | Primary hypothesis | Secondary/related | Reasoning |
| --- | --- | --- | --- |
| `/` | "software development company Nairobi" / "AI-native software development" | "custom software development Kenya", "software development company Africa" | Matches the existing title/description almost exactly; this is already well-targeted |
| `/services/ai-agents` | "AI agent development company" | "custom AI agents for business", "AI automation for customer support" | Matches the existing title |
| `/services/web-development` | "custom web development services" | "web application development company" | |
| `/services/mobile-development` | "mobile app development company" | "cross-platform app development", "offline-first mobile app" | The offline-first angle is a genuine differentiator worth leaning into harder (Teevexa's own Field app is proof); consider a dedicated FAQ or section on this page about offline-first architecture specifically |
| `/services/e-commerce-systems` | "e-commerce development company" | "M-Pesa integration developer", "Flutterwave integration", "Pesapal integration" | The regional-payment-gateway angle (M-Pesa, Pesapal, Paystack, Flutterwave) is a real, named differentiator already in the copy and is a lower-competition, higher-intent keyword cluster than generic "e-commerce development"; this page's content already supports it, internal linking could reinforce it more (see Section 4) |
| `/services/enterprise-software` | "custom ERP development" / "custom CRM development" | "workflow automation software", "enterprise software development Africa" | |
| `/services/ui-ux-design` | "UI/UX design services" | "WCAG accessibility design", "design systems Figma" | |
| `/prototype-to-production` | "take AI prototype to production" / "Lovable app production ready" | "Bolt.new to production", "v0 app production", "Cursor app deployment", "AI-built app security audit" | This page already names the specific tools (Lovable, Bolt, v0, Cursor) in its description, which is the right move: these are genuinely searched product names, not generic terms, and competition for "[tool name] to production" style queries is likely thin. This is the single highest-leverage SEO opportunity on the site; see Section 5. |
| `/teevexa-trace` | "supply chain traceability app" | "QR code product verification", "blockchain supply chain app", "batch verification app" | |
| `/teevexa-field` | "offline field data collection app" | "offline-first mobile data collection", "field agent app no internet" | |
| `/pricing` | "Teevexa Trace pricing" | n/a (branded) | Low search-volume by nature (branded pricing queries), kept mainly for user convenience, not a ranking target |
| `/verify` | "verify product batch" / "[brand] batch verification" | n/a | Mostly reached via QR code scan, not organic search; its SEO value is being a legitimate, useful, linkable utility page rather than a landing page competing for volume |
| `/open-source`, `/teedesk`, `/cyberguard-ai` | "open source AI customer support platform" (TeeDesk), "open source threat detection" (CyberGuard AI) | "self-hosted AI support platform", "Ollama customer support", "open source anomaly detection" | Developer-audience keywords; GitHub itself is likely a bigger discovery channel than Google search for these two, but the pages are a legitimate secondary surface |
| `/careers` | "software engineering jobs Nairobi" / "remote software engineer jobs Kenya" | n/a | |

## 3. Dynamic content types: keyword strategy for when content exists

Since zero blog posts, case studies or jobs currently exist (confirmed in `01-initial-audit.md`), there is nothing to retrofit here. What this section defines instead is **the editorial targeting approach for the first posts**, so that when the team starts writing, it's pointed at real opportunity rather than generic "top 10 tips" content that competes with thousands of similar posts.

### Recommended first blog topics (hypotheses, pick based on actual team expertise)

These follow directly from the site's own differentiators, which is the right starting point when there is no query data yet:

1. A detailed walkthrough of taking a Lovable/Bolt/v0/Cursor prototype to production (directly supports `/prototype-to-production`). **Published**, slug `your-ai-prototype-works-here-is-what-production-actually-requires`; see §5 for a corrected, search-verified read on how competitive this topic actually is.
2. A technical piece on offline-first mobile architecture (directly supports `/services/mobile-development` and `/teevexa-field`). **Published**, slug `what-offline-first-actually-means-in-mobile-app-architecture`.
3. A piece on integrating regional African payment gateways (M-Pesa, Pesapal, Flutterwave) into a web app, supporting `/services/e-commerce-systems`. **Published**, slug `integrating-m-pesa-pesapal-and-flutterwave-alongside-stripe-what-actually-differs`.
4. A supply chain traceability / compliance explainer, grounded in the real, current EU Deforestation Regulation requirements (verified via web search before writing, not assumed), supporting `/teevexa-trace` and `/api-docs`. **Drafted**, slug `supply-chain-compliance-reporting-explained`, handed to you for review and publish the same way as the first three.

All four of the originally identified topics are now published or drafted. Each maps directly to an existing static page, which matters for internal linking (Section 4): a blog post with nowhere relevant to link to is a weaker SEO asset than one that can pull readers straight into a service or product page. Every published post's internal links were verified live in the rendered HTML, not just assumed from the draft (see `07-validation-report.md` §9c).

### Next topics, once the original four are all live

Two more that follow the same rule (a real page to support, genuine Teevexa expertise, not generic filler):

5. Row-level security and role-based access patterns in multi-tenant applications, supporting `/services/enterprise-software`. This site's own Supabase RLS implementation (documented in every sibling repo's README produced in an earlier phase of this engagement) is real, demonstrable expertise, not a marketing claim.
6. What WCAG 2.2 AA accessibility actually requires in practice, supporting `/services/ui-ux-design` and `/accessibility`, a stated site-wide goal already.

Deliberately not proposing more than two at a time: padding this list to "fill a cadence" is exactly what this engagement's brief warns against. Add the next one only once these are live and there is a genuine next page or expertise area to support.

### Content assignment principle going forward

For every future blog post, case study, or job posting, the question to ask before publishing is: **which existing static page does this support, and does it link there?** A post that cannot name its target page is either too generic (compete-with-everyone content) or belongs somewhere else in the site structure. This also avoids the content-cannibalization risk this engagement's brief explicitly warns about: do not publish five different posts all targeting "AI agent development" when one well-linked post reinforcing `/services/ai-agents` is more effective than five competing with each other and with the service page itself.

## 4. Internal linking gaps found during the audit

- **`/prototype-to-production`** (priority 0.95, the second-highest-priority page on the site after the homepage): initially flagged here as needing more prominent linking, based on `Navbar.tsx` alone not listing it as a top-level item. On closer inspection of `Index.tsx`, that concern doesn't hold up: the homepage already has a dedicated section for it directly below the hero and stats bar (`Index.tsx` lines 182-208), a glass card with its own headline, a bulleted feature list, and two calls to action (`Price my prototype`, `How it works`), well ahead of the generic services section. `Footer.tsx` also links it directly. **Correcting the record**: no further internal-linking work is needed here; the earlier recommendation in this document and in `09-prioritized-roadmap.md` is withdrawn.
- **`/open-source`** and its two project pages are not linked from `/services` at all, even though `TeeDesk` and `CyberGuard AI` double as credibility/portfolio evidence for engineering capability. `/portfolio` does link to them (confirmed in `Portfolio.tsx`), which is the right primary location; a secondary mention from `/about` (engineering culture/credibility) would reinforce entity signals for AI-search purposes (Section 7 of `01-initial-audit.md`) without duplicating `/portfolio`'s role.
- Once blog content exists, every post should link to at least one relevant service, product, or portfolio page (Section 3 above) and the relevant service/product pages should, over time, link back to the posts that support them. This is a two-way linking discipline to establish from the first post, not retrofit later.

## 5. Why `/prototype-to-production` deserves attention, corrected with real search data

**Correction to an earlier claim in this document**: this section originally described the "AI prototype to production" intent as "lower-competition" and "genuinely underserved," based on reasoning about the market rather than an actual search. A real `WebSearch` run during this engagement (query: "AI prototype to production Lovable Bolt v0 Cursor security audit") disproved that: this is an **actively contested space**, not a gap. Real competitors found include RaftLabs, Pagepro, Southleft, Magora, DreamzTech, and multiple individual freelancers offering near-identical "AI-built app security and code audit" services on Upwork and Contra. `teevexa.com` does not appear anywhere in these results, which is the honest current baseline, not a ranking yet, for a brand-new post on a young site.

This does not mean the page or the first blog post built around it were a wrong choice. It means the opportunity is **differentiation and execution within a real market**, not an empty field:

- Teevexa can substantiate its version of this with real work (this is explicitly how Teevexa positions itself per `prototype-to-production`'s FAQ and the site's own copy), which not every competitor in the search results above can claim as credibly.
- The page is already reasonably well optimized at the page level (title, description, `Service` + `FAQPage` JSON-LD all present and correct, per `02-url-inventory.md`).
- Competing well here means the content needs to be genuinely more specific and useful than the search results above, not just present. The first blog post (`03-keyword-and-content-map.md` §3, published during this engagement) leads with a concrete checklist rather than generic claims, which is a reasonable starting position but will need to earn its ranking against real competition over time, not assume one by default.

The original "highest-leverage, lowest-cost" framing is replaced with a more honest one: this is a worthwhile, defensible position to build from, in a market that has to be competed in, not a gap that can be filled once and left alone.

## 6. Real search-visibility baseline for the other content-map hypotheses

Two more `WebSearch` checks run during this engagement, to validate hypotheses rather than leave them all as guesses:

- **"offline-first mobile app development company Africa"**: a genuinely thinner field. One real specialist found (a firm describing local-first sync, conflict resolution and queued operations for low-bandwidth environments), versus the crowded result for the prototype-to-production query above. This supports the original hypothesis for this topic better than the prototype-to-production one did; `teevexa.com` does not appear, same honest baseline.
- **"software development company Nairobi AI native"**: a crowded local market, not a gap. Multiple real Nairobi-based competitors surfaced directly (Moshcode Studio, Qaribuhub, Afrisyntech, VelocityAI Solutions, Tripleaim Software), and GoodFirms alone lists 132 software development companies in Kenya as of August 2026. `teevexa.com` does not appear in the search results, and **Teevexa is not listed on GoodFirms**, which turns the speculative "consider business directories" suggestion in `05-ai-search-strategy.md` §3 into a concrete, verified gap: GoodFirms specifically, and likely comparable directories (Clutch, The Manifest, which also surfaced in these results), do not currently list Teevexa at all.

This is a small, representative sample, three queries, not a full keyword audit, but it is three real data points instead of zero, and it already corrected one of this document's own hypotheses (§5). Treat the rest of this document's keyword hypotheses with the same scrutiny before relying on them for content decisions; see the caveat at the top of this document.

## 7. What I will not do

Per this engagement's explicit rules: no keyword-stuffed pages, no doorway pages, no artificial location pages (Teevexa serves "Worldwide" from one Nairobi base; there is no legitimate second office or service area to build a page for), and no mass-produced near-duplicate articles targeting keyword variations. A keyword list with fifty variations of "software development company X" does not justify fifty pages; it justifies one well-targeted page (which already exists: `/`) and, at most, a handful of genuinely distinct service pages (which also already exist).
