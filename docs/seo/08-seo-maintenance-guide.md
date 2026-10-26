# SEO Maintenance Guide: teevexa-web

Written for whoever maintains this site day to day: a content editor publishing blog posts, and a developer adding new pages. If you only read one section, read Section 2 (publishing checklist) and Section 4 (adding a new static page).

## 1. How the SEO system works, in one paragraph

Every static page's SEO data (title, description, priority, structured data) lives in one file: `src/seo/routes.ts`. That one file drives three things automatically: the `<SEO>` component every page renders with (for live browsing), the sitemap generator, and the build-time prerender script that writes real static HTML for every route. You should essentially never need to hand-write a `<title>` tag or a meta description directly in a page component; add it to `src/seo/routes.ts` instead, and everything else follows from that.

For blog posts and case studies (database-backed content), the title/description are auto-derived from the post's own `title`/`excerpt`/`description` fields, with optional overrides (see Section 2).

## 2. Publishing a blog post or case study: checklist

1. Fill in Title, Slug (auto-generated from title, or set your own), Excerpt, Content, Cover Image, Tags.
2. **Before publishing**, open the "Search & social" section of the editor:
   - **SEO title override**: leave blank unless the post title is long or doesn't read well as a search result headline on its own. Keep it under 60 characters if you fill it in (the input is capped there).
   - **SEO description override**: leave blank unless the excerpt doesn't work as a search snippet. Aim for 110-160 characters.
   - **Author byline** (blog posts only): fill this in with a real person's name. It shows on the page and in the structured data search engines read. Leaving it blank falls back to "Teevexa", which is fine for a company-voice post but weaker for anything written by a named engineer.
   - **Noindex checkbox**: leave unchecked for anything you want found in search. Check it only for something you want live on the site but deliberately excluded from search results (an internal-facing post, something outdated you don't want to delete but don't want ranking either).
3. Set Status to "Published". This immediately:
   - Makes the post live on `/insights/<slug>` (or `/portfolio/<slug>`).
   - Triggers a site rebuild in the background, so the post gets its own prerendered page and a sitemap entry without you needing to tell anyone. (This only works once `DEPLOY_HOOK_URL` is configured; see Section 6. Until then, the post is still live and working, it just won't get its dedicated static HTML/sitemap entry until the next regular code deploy.)
4. Double-check the live page once it's up: does the title in the browser tab look right? Does sharing the link in Slack/WhatsApp show the cover image correctly?

## 3. Writing good titles and descriptions

- Title: describe what the page is about in plain language a search result would make sense out of context. Don't repeat the brand name beyond what's already automatically appended ("| Teevexa" is added for you).
- Description: write it like the one or two sentences you'd want a stranger to read under your link in Google. Not a keyword list. The automated test suite (`src/test/seo.test.ts`) enforces 110-160 characters for every static page; the same guidance applies to post/case-study overrides even though they aren't enforced by that test.
- Don't stuff keywords. One clear sentence that actually describes the content outperforms a sentence trying to hit five search terms.

## 4. Adding a new static page (developer task)

1. Add the route to `src/App.tsx`.
2. Add a matching entry to `PAGES` in `src/seo/routes.ts` (title, description, `crumb`, `changefreq`, `priority`, and any `jsonLd` that applies).
3. Run `npm test`. The existing test suite will fail loudly if the route and the SEO entry don't match 1:1, by design, so you cannot ship a page with no SEO data or SEO data for a page that doesn't exist.
4. That's it. The sitemap and prerendered HTML pick the new page up automatically on the next build.

## 5. Adding a new service (developer task)

Services are a special case of the above: add the slug's data to `serviceData` in `src/pages/ServiceDetail.tsx` *and* a matching `/services/<slug>` entry in `PAGES`. A dedicated test (`src/test/seo.test.ts`, "service pages" describe block) checks these stay in sync; it will fail if you add one without the other.

## 6. One-time setup still needed (see `06-implementation-log.md` for full detail)

- Apply the `blog_and_case_study_seo_fields` migration.
- Create a Vercel Deploy Hook and set it as the `DEPLOY_HOOK_URL` Supabase secret, so publishing content actually triggers the rebuild described in Section 2.
- Deploy the `trigger-rebuild` edge function.
- Deploy the `vercel.json` fix (urgent; see `01-initial-audit.md`).

## 7. Ongoing monitoring (monthly, unless noted)

| What | Where | Why |
| --- | --- | --- |
| Organic impressions/clicks/CTR, by page | Google Search Console → Performance | Catch pages losing visibility early |
| Indexed vs. submitted URLs | Search Console → Pages | Catch indexing problems (a page that stops being indexed is often a real technical regression) |
| Crawl errors | Search Console and Bing Webmaster Tools | Same |
| AI-platform referral traffic | Plausible's referrer breakdown, filter for `chat.openai.com`, `perplexity.ai`, `bing.com/chat` and similar | Directional signal only (see `05-ai-search-strategy.md`) |
| Manual AI-answer spot check (quarterly) | Ask ChatGPT/Perplexity/Google a handful of target queries from `03-keyword-and-content-map.md`, note whether/how Teevexa comes up, and record it as a new dated entry in `10-search-visibility-log.md` (first baseline entry already in there from 2026-10-26) | Directional signal only |
| Run `npm test` and `npm run build` | Locally or in CI, before any deploy that touches `src/seo/`, `scripts/`, or page SEO | Catches a broken/duplicated/missing title or description before it ships |

## 8. Things never to do (carried over from this engagement's rules, worth repeating here)

- Don't invent a rating, review, price, or specification for a product that doesn't have real ones in the database.
- Don't add location pages for cities Teevexa doesn't actually operate in.
- Don't publish five near-duplicate posts targeting slightly different keyword variants of the same topic; write one good one and link to it from the pages it supports.
- Don't block or allow a crawler in `robots.txt` as a reaction to a single bad experience without thinking through the tradeoff described in `05-ai-search-strategy.md` §1.
