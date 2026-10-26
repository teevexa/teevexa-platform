# SEO URL Inventory: teevexa-web

Companion machine-readable file: [`02-url-inventory.csv`](./02-url-inventory.csv) (one row per URL, the full column set described below). This document is the organized summary; the CSV is the complete, per-URL data.

Source of truth used to build this inventory: `src/seo/routes.ts` (`PAGES`), `src/App.tsx` (every `<Route>`, including ones not in `PAGES`), the three dynamic-content tables in Supabase (`blog_posts`, `case_studies`, `jobs`, queried live), and live HTTP checks against `https://www.teevexa.com` performed during this audit (results below predate the `vercel.json` fix described in `01-initial-audit.md` unless noted "post-fix").

Total distinct URL definitions in the app: **77**, across 74 `<Route>` elements in `App.tsx` (a handful of elements, like `/services/:slug`, represent multiple distinct static pages each already named individually in `PAGES`). Breakdown:
- **25 static, publicly indexable pages** (everything in `PAGES` with `noindex` unset; verified directly: `INDEXABLE_PATHS.length === 25`)
- **4 static, intentionally `noindex` pages** (legal x3, account deletion instructions)
- **2 retired-URL redirects** (`/teevexa-desk`, `/teevexa-base`)
- **3 dynamic content *types*** (`blog_posts` → `/insights/:slug`, `case_studies` → `/portfolio/:slug`, `jobs` → `/careers/:slug`), currently producing **zero live URLs** (Section 4.3 of the audit: no published rows exist yet)
- **2 account-less utility pages** (`/verify`, `/trace/:batchId`), one indexable (the lookup form, already counted in the 25 above) and one not (individual batch results)
- **3 auth pages** (`/auth`, `/forgot-password`, `/reset-password`), not indexable by design, not in `PAGES`/sitemap
- **14 client portal routes** (`/client-portal` plus 13 named children, including its own `index`/dashboard route), authenticated, RLS-protected, blocked in `robots.txt`
- **24 admin routes** (`/admin` plus 23 named children, including its own `index`/dashboard route), authenticated, RLS-protected, blocked in `robots.txt`
- **1 catch-all 404**

The 14 portal and 24 admin routes are enumerated once in Section 6 rather than repeated per-row in the main table, since they are uniform in treatment (authenticated, `noindex` by access control, not in the sitemap, not relevant to public SEO work) and listing all 38 individually would not add information.

## 1. Homepage

| Field | Value |
| --- | --- |
| URL | `/` |
| Type | Homepage |
| HTTP status (live) | 200 |
| Indexable | Yes |
| Title | "Teevexa \| AI-Native Software Development in Nairobi" (57 chars) |
| Meta description | "Nairobi-based engineering team building custom software, AI agents and production-ready apps for businesses worldwide. Get a tailored quote in 24 hours." (154 chars) |
| Canonical | `https://www.teevexa.com` |
| H1 | Real `<h1>` in `Index.tsx:131` (hero headline) |
| Search intent | Navigational/branded + broad commercial ("software development company Nairobi/Kenya/Africa") |
| Primary keyword opportunity | "software development company Nairobi" / "AI-native software development" |
| Content completeness | Complete; real sections (hero, services summary, products, process, CTA) |
| Structured data | `Organization`/`ProfessionalService` + `WebSite` (global, every page) |
| Sitemap | Yes, priority 1.0, weekly |
| Issues | None structural. Opportunity: homepage could link more explicitly to `/portfolio` and `/insights` once those have real content, to spread internal link equity (see `03-keyword-and-content-map.md`). |

## 2. Company / about

| URL | Title | Noindex | Notes |
| --- | --- | --- | --- |
| `/about` | "About Teevexa \| AI-Native Product Engineering Company" | No | `AboutPage` JSON-LD. Real H1. Content covers founding story, team, approach; verified in a prior engagement on this repo. |
| `/accessibility` | "Accessibility Statement \| Teevexa" | No | Uses `LegalLayout` (real H1 via the shared component). Low priority (0.3) and `yearly` changefreq, correctly reflecting its low commercial intent and infrequent change. |

## 3. Services

| URL | Title | Search intent | Structured data | Notes |
| --- | --- | --- | --- | --- |
| `/services` | "Software Development Services: Web, Mobile, AI \| Teevexa" | Commercial, category hub | None page-level (only global) | Lists all 6 sub-services with real `<h1>` via `SectionHeading as="h1"`; links to every detail page. No `Service` list/`ItemList` schema on the hub itself; minor enhancement, not a defect. |
| `/services/ai-agents` | "AI Agent Development Company \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique problem/gap/approach/feature copy (verified in `ServiceDetail.tsx`, not templated filler) |
| `/services/web-development` | "Custom Web Development Services \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique copy |
| `/services/mobile-development` | "Mobile App Development Company \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique copy; cross-links to the company's own Android apps as proof |
| `/services/e-commerce-systems` | "E-Commerce Development & Payments Integration \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique copy, names real regional payment gateways |
| `/services/enterprise-software` | "Enterprise Software Development: ERP & CRM \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique copy |
| `/services/ui-ux-design` | "UI/UX Design Services \| Teevexa" | Commercial, specific | `Service` JSON-LD | Unique copy |

All six service-detail slugs are enforced 1:1 against `PAGES` by `src/test/seo.test.ts`'s "service pages" test, so this group cannot silently drift out of sync (a slug added to `ServiceDetail.tsx` without matching SEO data, or vice versa, fails CI/`npm test`).

## 4. Conversion pages

| URL | Title | Intent | Notes |
| --- | --- | --- | --- |
| `/start-project` | "Get a Quote for Your Software Project \| Teevexa" | Transactional (the primary conversion goal of the whole site) | No dedicated structured data (a `start-project`/quote funnel is a poor fit for existing schema types; correctly left plain) |
| `/book-consultation` | "Book a Free 20-Minute Consultation \| Teevexa" | Transactional, secondary | |
| `/contact` | "Contact Teevexa \| Software Development Team, Nairobi" | Navigational/transactional | `ContactPage` + `FAQPage` JSON-LD |
| `/prototype-to-production` | "Take Your AI Prototype to Production \| Teevexa" | Commercial, highest priority (0.95) after the homepage | `Service` + `FAQPage` JSON-LD. This is the site's most differentiated, highest-intent landing page (AI-prototype-to-production repositioning); see `03-keyword-and-content-map.md` for why it deserves more inbound internal links than it currently gets. |

## 5. Products (Teevexa Trace / Field)

| URL | Title | Structured data | Live-link verification |
| --- | --- | --- | --- |
| `/teevexa-trace` | "Teevexa Trace \| Supply Chain Traceability App" | `SoftwareApplication` (Android) | Google Play link verified reachable in a prior session of this engagement |
| `/teevexa-field` | "Teevexa Field \| Offline Field Data Collection App" | `SoftwareApplication` (Android) | Same |
| `/pricing` | "Teevexa Trace & Field Pricing \| Free While We Launch" | None | Honest "free while we launch" framing, no fabricated pricing tiers |
| `/verify` | "Verify a Product Batch \| Teevexa Trace" | None | Account-less batch-ID lookup form; correctly indexable (it is genuinely useful, unique utility content, not a dead end) |
| `/api-docs` | "Teevexa Trace API Docs \| Batch Verification API" | None | Developer-facing documentation page |

### Dynamic, not in `PAGES`: `/trace/:batchId`

Individual batch verification results. Explicitly `noindex` (`TraceBatch.tsx:371`), correctly: each is a lookup result for one specific physical product batch, not canonical public content, and there is no fixed, enumerable list of them to usefully index. This is a deliberate and correct decision already in the code, not a gap.

## 6. Open source

| URL | Title | Structured data |
| --- | --- | --- |
| `/open-source` | "Open-Source Projects: TeeDesk & CyberGuard AI \| Teevexa" | None page-level; real H1 via `SectionHeading as="h1"`, links out to both project pages and their GitHub repos |
| `/teedesk` | "TeeDesk \| Open-Source AI Customer Support Platform" | `SoftwareSourceCode` |
| `/cyberguard-ai` | "CyberGuard AI \| Open-Source Threat Detection" | `SoftwareSourceCode` with a real `license` property (Apache 2.0) |

## 7. Portfolio (static showcase + dynamic case studies)

| URL | Status | Notes |
| --- | --- | --- |
| `/portfolio` | Indexable, `CollectionPage` JSON-LD | Shows 3 static featured products (Trace, TeeDesk, CyberGuard AI) via hardcoded data in `Portfolio.tsx`, plus a live Supabase query for `case_studies` (`status = published`). Real H1. |
| `/portfolio/:slug` | **Zero live URLs currently** | Template exists (`PortfolioDetail.tsx`), correctly builds canonical, breadcrumb, `og:image` from `cover_image_url`, and sets `noindex` on its own "not found" state. No `Review`/`AggregateRating` or `Product` schema is emitted for case studies, which is correct: case studies are not products with genuine prices/ratings, and inventing that schema would violate the "never fabricate... ratings" rule in this engagement's brief. |

## 8. Blog / Insights (static listing + dynamic posts)

| URL | Status | Notes |
| --- | --- | --- |
| `/insights` | Indexable, real H1, tag-filtered client-side listing | Live Supabase query for `blog_posts` (`status = published`). Currently renders the built-in "No articles yet" empty state, truthfully, rather than a fake "coming soon" with fabricated post previews. |
| `/insights/:slug` | **Zero live URLs currently** | Template exists (`InsightDetail.tsx`), correctly builds `Article` JSON-LD with real `datePublished`/`dateModified`, sets `og:type=article`. Author is hardcoded to the string `"Teevexa"` rather than resolved from the real `author_id` column (finding 4.6 in the audit). Article body is Markdown rendered client-side only; not present in the prerendered static HTML (finding 4.4). |

## 9. Careers (static listing + dynamic job postings)

| URL | Status | Notes |
| --- | --- | --- |
| `/careers` | Indexable, real H1 | Live Supabase query for `jobs` (`status = open`) |
| `/careers/:slug` | **Zero live URLs currently** | Template exists (`CareerDetail.tsx`), prerender script (`prerender.mjs:104-108`) builds `JobPosting` JSON-LD with `employmentType`, `jobLocationType` (correctly flags `TELECOMMUTE` for remote roles), `datePosted`. Generated title uses an em dash (`${r.title} — ${r.department} \| Teevexa Careers`); cosmetic only, not an SEO defect, but inconsistent with the plain-punctuation convention used in this company's other documentation; flagged for optional cleanup. |

## 10. Legal and account pages (deliberately `noindex`)

| URL | Title | Reason for `noindex` |
| --- | --- | --- |
| `/legal/privacy-policy` | "Privacy Policy \| Teevexa" | Standard practice; legal boilerplate pages add no unique search value and commonly get filtered/devalued by Google anyway |
| `/legal/terms-of-service` | "Terms of Service \| Teevexa" | Same |
| `/legal/cookies` | "Cookie Policy \| Teevexa" | Same |
| `/account/delete` | "Delete Your Account \| Teevexa Trace" | Account-management instructions, not marketing content |

These are correct, deliberate exclusions, not oversights: `INDEXABLE_PATHS` in `src/seo/routes.ts` filters them out, `src/test/seo.test.ts` enforces that every `noindex: true` page is excluded from `INDEXABLE_PATHS`, and the sitemap generator (`generate-sitemap.mjs:10-12`) filters on the same flag, so they cannot leak into the sitemap by accident.

## 11. Auth, portal, and admin (not public SEO surfaces)

| Group | Routes | Indexable | Protection |
| --- | --- | --- | --- |
| Auth | `/auth`, `/forgot-password`, `/reset-password` | No (not in `PAGES`, not in sitemap) | `robots.txt` disallows all three explicitly |
| Client portal | `/client-portal` + 13 sub-routes (dashboard, projects, project detail, timeline, activity, deliverables, support, files, messages, invoices, proposals, meeting-notes, api-keys, settings) | No | `robots.txt` disallows `/client-portal/`; RLS + `PortalLayout.tsx` role guard is the real protection |
| Admin | `/admin` (dashboard, the index route) + 23 named sub-routes (leads, consultations, contacts, proposals, projects, project detail, tasks, kanban, milestones, deliverables, messages, support-tickets, time-tracking, role-activity, reports, users, invoices, meeting-notes, blog, portfolio, careers, audit-logs, settings) | No | `robots.txt` disallows `/admin/`; RLS + `AdminLayout.tsx` role guard is the real protection |

None of these 38 routes are candidates for public SEO work; they are listed here only so this inventory is complete per the brief's instruction not to omit discovered routes, and so the next person maintaining this site can see at a glance that the exclusion is deliberate and layered (crawling courtesy + real access control), not accidental.

## 12. Retired URLs (redirects)

| Old URL | New destination | Mechanism before this audit | Mechanism after this audit |
| --- | --- | --- | --- |
| `/teevexa-desk` | `/teedesk` | Client-side `<Navigate>` only, **live-confirmed broken (404)**, see `01-initial-audit.md` §4.1 | Real HTTP 301/308 redirect added to `vercel.json`, plus the existing client-side fallback |
| `/teevexa-base` | `/` | Same | Same |

## 13. Error page

| URL pattern | Status | Notes |
| --- | --- | --- |
| Any unmatched path | 200 (SPA shell) with client-side `noindex`, **or** bare Vercel platform 404 pre-fix | See `01-initial-audit.md` §4.1 and §4.9 for the full explanation and the fix applied. |

## 14. Summary counts

| Category | Count | In sitemap | Notes |
| --- | --- | --- | --- |
| Static indexable pages | 25 | 25 | Matches `INDEXABLE_PATHS.length` from `src/seo/routes.ts`, verified directly |
| Static `noindex` pages | 4 | 0 | Correctly excluded |
| Dynamic blog posts | 0 (live) | 0 | Template ready |
| Dynamic case studies | 0 (live) | 0 | Template ready |
| Dynamic job postings | 0 (live) | 0 | Template ready |
| Retired-URL redirects | 2 | N/A | Now real HTTP redirects |
| Account-less utility | 1 (`/trace/:batchId`, not indexable; `/verify` is already counted in the 25 static indexable pages) | 0 | |
| Auth | 3 | 0 | |
| Client portal | 14 | 0 | |
| Admin | 24 | 0 | |
| 404 catch-all | 1 | 0 | |
| **Total distinct URL definitions** | **77** | **25** | |

This confirms `public/sitemap.xml`'s current 25 URLs (verified by direct inspection: `grep -c "<url>" public/sitemap.xml` after a fresh build) are exactly and correctly the full indexable static set, with the 0-count dynamic content explaining the absence of any `/insights/*`, `/portfolio/*` or `/careers/*` sitemap entries today.
