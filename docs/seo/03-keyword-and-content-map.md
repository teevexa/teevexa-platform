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

1. A detailed walkthrough of taking a Lovable/Bolt/v0/Cursor prototype to production (directly supports `/prototype-to-production`, and is genuinely underserved content: most "AI app builder" content is about building the prototype, not what comes after).
2. A technical piece on offline-first mobile architecture (directly supports `/services/mobile-development` and both Android products; Teevexa has real, shipped proof of this, which is a legitimate expertise claim, not a marketing assertion).
3. A piece on integrating regional African payment gateways (M-Pesa, Pesapal, Flutterwave) into a web app, which supports `/services/e-commerce-systems` and is a narrow enough topic that it is unlikely to face the same competition as generic "how to accept online payments" content.
4. A supply chain traceability / compliance explainer (EUDR-style reporting is mentioned in the Trace product; a plain-language explainer of what compliance reporting actually requires would support `/teevexa-trace` and `/api-docs`).

Each of these maps directly to an existing static page, which matters for internal linking (Section 4): a blog post with nowhere relevant to link to is a weaker SEO asset than one that can pull readers straight into a service or product page.

### Content assignment principle going forward

For every future blog post, case study, or job posting, the question to ask before publishing is: **which existing static page does this support, and does it link there?** A post that cannot name its target page is either too generic (compete-with-everyone content) or belongs somewhere else in the site structure. This also avoids the content-cannibalization risk this engagement's brief explicitly warns about: do not publish five different posts all targeting "AI agent development" when one well-linked post reinforcing `/services/ai-agents` is more effective than five competing with each other and with the service page itself.

## 4. Internal linking gaps found during the audit

- **`/prototype-to-production`** (priority 0.95, the second-highest-priority page on the site after the homepage) is not linked from the main navigation in a prominent way relative to its priority (confirmed by reading `Navbar.tsx`'s structure during the broader audit; it is reachable but not a top-level nav item the way `/services` is). Given this is the site's most differentiated page, consider a dedicated homepage section or banner linking to it, not just a services sub-link. This is a content/design decision, not a code defect; flagged here as an opportunity rather than implemented unilaterally, since it affects the homepage's visual design.
- **`/open-source`** and its two project pages are not linked from `/services` at all, even though `TeeDesk` and `CyberGuard AI` double as credibility/portfolio evidence for engineering capability. `/portfolio` does link to them (confirmed in `Portfolio.tsx`), which is the right primary location; a secondary mention from `/about` (engineering culture/credibility) would reinforce entity signals for AI-search purposes (Section 7 of `01-initial-audit.md`) without duplicating `/portfolio`'s role.
- Once blog content exists, every post should link to at least one relevant service, product, or portfolio page (Section 3 above) and the relevant service/product pages should, over time, link back to the posts that support them. This is a two-way linking discipline to establish from the first post, not retrofit later.

## 5. Why `/prototype-to-production` deserves disproportionate attention

This is the one page on the site targeting a genuinely novel, well-defined, lower-competition search intent: businesses and individuals who used an AI app builder (Lovable, Bolt, v0, Cursor, or similar) to get a working prototype, and now need it hardened, secured, and deployed for real users. This is:

- A real, current market gap (AI app builders are new enough that "what happens after the prototype" content is genuinely underserved, as of this audit).
- Something Teevexa can substantiate with real work (this is explicitly how Teevexa positions itself per `prototype-to-production`'s FAQ and the site's own copy).
- Already reasonably well optimized at the page level (title, description, `Service` + `FAQPage` JSON-LD all present and correct, per `02-url-inventory.md`).

The gap is distribution, not on-page optimization: more internal links pointing at it, and the first blog posts (Section 3) reinforcing it. This is the single highest-leverage, lowest-cost recommendation in this entire content strategy.

## 6. What I will not do

Per this engagement's explicit rules: no keyword-stuffed pages, no doorway pages, no artificial location pages (Teevexa serves "Worldwide" from one Nairobi base; there is no legitimate second office or service area to build a page for), and no mass-produced near-duplicate articles targeting keyword variations. A keyword list with fifty variations of "software development company X" does not justify fifty pages; it justifies one well-targeted page (which already exists: `/`) and, at most, a handful of genuinely distinct service pages (which also already exist).
