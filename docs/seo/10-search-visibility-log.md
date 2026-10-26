# Search Visibility Log: teevexa-web

A running, dated record of search-visibility checks, so the quarterly cadence in `08-seo-maintenance-guide.md` §7 produces a real history instead of a series of one-off snapshots that get lost. Add a new dated entry each quarter (or whenever a check is run); never overwrite a previous entry.

**What this log is, and is not**: entries here are built from `WebSearch` queries, which reflect that tool's underlying search index, not a literal transcript of asking ChatGPT, Perplexity, or Google's AI Overviews directly, and not necessarily identical to what a person sees on google.com (different index, different personalization, different freshness). Treat every entry as a directional signal, not a precise ranking report. Where this log disagrees with what you see directly in Search Console or a browser, trust Search Console and your own browser.

---

## 2026-10-26: Baseline (first entry, Engagement 1)

Context: three blog posts published this week (the first real content on the site). Checked brand visibility and the exact query clusters those three posts, plus the site generally, target.

| Query | What came back | Teevexa visible? |
| --- | --- | --- |
| `Teevexa` (bare brand name) | Unrelated results only (a trademark listing, a pharmaceutical company, a Mexican marketplace seller). Nothing related to the company at all. | **No.** Worth checking directly, not just trusting this tool. See note below. |
| `Teevexa software Nairobi` | Other Nairobi software companies (Software Technologies Limited, Bytesos, Innovex Solutions, SoftwaresKe), no mention of Teevexa. Surfaced `clutch.co/ke/developers/nairobi` as a real, relevant directory. | No |
| `software development company Nairobi AI native` | Crowded field: Moshcode Studio, Qaribuhub, Afrisyntech, VelocityAI Solutions, Tripleaim Software; GoodFirms lists 132 Kenya-based firms. | No |
| `AI prototype to production Lovable Bolt v0 Cursor security audit` | Active competitors already in this space: RaftLabs, Pagepro, Southleft, Magora, DreamzTech, plus individual freelancers on Upwork/Contra. | No |
| `offline-first mobile app development company Africa` | Thinner field; one real specialist found (PANEOTECH). | No |
| `M-Pesa Pesapal Flutterwave payment integration developer guide` | Mostly vendor/developer documentation (Flutterwave's own docs, a Flutter package wrapping Pesapal), not competing editorial content. | No |

**Headline finding**: zero visibility across every query checked, including the bare brand name. For a site with a handful of indexed pages and three blog posts published this same week, this is roughly the expected baseline, not a red flag on its own; the useful signal is what changes from here, not this single snapshot. The one result worth checking personally rather than trusting this log: `Teevexa` (bare brand name) returning nothing at all, which is unusual for an exact, unique brand term. Check Search Console's Coverage/Indexing report and compare against a direct `google.com` search for `teevexa.com` before concluding anything is actually wrong.

**Competitive landscape notes for the content strategy** (full detail and the correction this produced: `03-keyword-and-content-map.md` §5-6):
- "AI prototype to production" is a real, contested market, not the low-competition gap originally assumed.
- "Offline-first mobile Africa" has less competition.
- The Nairobi general-software-dev market is crowded; GoodFirms and Clutch both surfaced as directories where Teevexa is not currently listed (`05-ai-search-strategy.md` §3).

**Next entry due**: approximately 2027-01, per the quarterly cadence. Earlier if you want a progress check sooner, since there's no cost to running one.

---

## Template for future entries

```
## YYYY-MM-DD: [label, e.g. "Q1 2027"]

Context: [what changed since the last entry, e.g. "N more posts published", "LinkedIn/directory fixes made"]

| Query | What came back | Teevexa visible? |
| --- | --- | --- |
| ... | ... | ... |

Headline finding: ...
Changes since last entry: ...
Next entry due: ...
```
