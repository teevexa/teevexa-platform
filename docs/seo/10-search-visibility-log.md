# Search Visibility Log: teevexa-web

A running, dated record of search-visibility checks, so the quarterly cadence in `08-seo-maintenance-guide.md` §7 produces a real history instead of a series of one-off snapshots that get lost. Add a new dated entry each quarter (or whenever a check is run); never overwrite a previous entry.

**What this log is, and is not**: entries here are built from `WebSearch` queries, which reflect that tool's underlying search index, not a literal transcript of asking ChatGPT, Perplexity, or Google's AI Overviews directly, and not necessarily identical to what a person sees on google.com (different index, different personalization, different freshness). **This is not theoretical**: the 2026-10-26 entry below originally reported zero Google visibility for the bare brand name; a real browser search the same day showed Teevexa ranking first with an accurate AI Overview. Treat every "not visible" result in this log as unconfirmed, not as evidence of an actual problem, until checked directly. Where this log disagrees with Search Console or a real browser, trust Search Console and the browser.

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

**Headline finding, corrected**: this log originally reported zero visibility across every query checked, including the bare brand name, and flagged that specific result as worth checking directly rather than trusting this tool. That check was done: a real `google.com` search for `Teevexa` (screenshot provided same day) shows the site ranking first, a Google AI Overview describing the company accurately (correct founding date, correct founder, correct positioning), a Knowledge Panel-style card for `www.teevexa.com` and a separate card for "Teevexa Field" on Google Play, plus the homepage's real meta description. **This confirms the `WebSearch` tool used to build this log does not reliably reflect Google's actual index or results for this site**, at least for exact brand terms. Every "not visible" finding in the table above should be treated as unconfirmed by Google specifically, not as evidence of an actual visibility problem, until re-checked the same way (a real browser search, or Search Console data) rather than this tool alone.

**Practical takeaway**: keep using `WebSearch` for competitive-landscape research (it is reasonable for that, see the competitor findings below, which are about other companies' content existing, not about Teevexa's own ranking) but do not trust it alone for Teevexa's own visibility. Future entries in this log should include a real Google check for at least the brand-name query, the same way this correction was made.

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
