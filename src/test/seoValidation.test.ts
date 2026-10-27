import { describe, it, expect } from "vitest";
import { validateSeoFields } from "../lib/seoValidation";

// Only the deterministic, non-network checks are covered here (they return before ever touching
// Supabase): a draft is allowed to be messy, a published record is not. The duplicate-title check
// needs a real Supabase client and is exercised manually against the live admin editors instead.
const base = {
  table: "blog_posts" as const,
  excludeId: null,
  title: "A real title",
  metaTitle: "",
  metaDescription: "",
  summary: "A real excerpt that is long enough to be a real excerpt.",
};

describe("validateSeoFields", () => {
  it("requires a title regardless of status", async () => {
    expect(await validateSeoFields({ ...base, title: "  ", status: "draft" })).toMatch(/title is required/i);
  });

  it("skips every other check for a draft", async () => {
    expect(await validateSeoFields({ ...base, summary: "", metaDescription: "x", status: "draft" })).toBeNull();
  });

  it("requires a summary before publishing", async () => {
    expect(await validateSeoFields({ ...base, summary: "", status: "published" })).toMatch(/excerpt is required/i);
  });

  it("rejects an SEO description override that is too short", async () => {
    expect(await validateSeoFields({ ...base, metaDescription: "Too short.", status: "published" })).toMatch(/50-300/);
  });

  it("rejects an SEO description override that is too long", async () => {
    expect(await validateSeoFields({ ...base, metaDescription: "x".repeat(301), status: "published" })).toMatch(/50-300/);
  });
});

// The duplicate-title check (the one branch that queries Supabase) is intentionally not unit
// tested here: it would need a mocked or live database to exercise meaningfully, and every case
// above already returns before that branch runs. It was verified manually against the real admin
// editors and the live blog_posts/case_studies tables instead; see docs/seo/06-implementation-log.md.
