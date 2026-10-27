// Shared publish-time SEO validation for the blog and portfolio admin editors.
// Only enforced when actually publishing: a draft can be messy while someone is still writing it.
import { supabase } from "@/integrations/supabase/client";

export interface SeoValidationInput {
  table: "blog_posts" | "case_studies";
  /** The record being edited, so it doesn't collide with itself in the duplicate check. null when creating a new one. */
  excludeId: string | null;
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** `excerpt` for blog_posts, `description` for case_studies: whichever field the public page falls back to when no meta_description override is set. */
  summary: string;
  status: string;
}

const RECORD_LABEL: Record<SeoValidationInput["table"], string> = {
  blog_posts: "post",
  case_studies: "case study",
};

/** Returns a human-readable error to show the editor, or null if the record is safe to save as-is. */
export async function validateSeoFields(input: SeoValidationInput): Promise<string | null> {
  const title = input.title.trim();
  if (!title) return "Title is required.";

  // Everything below only matters once the record is actually going live; a draft-in-progress
  // can have an empty excerpt or an unfinished description without blocking the save.
  if (input.status !== "published") return null;

  if (!input.summary.trim()) {
    return `A ${input.table === "blog_posts" ? "excerpt" : "description"} is required before publishing: it becomes the search result snippet whenever no SEO description override is set.`;
  }

  const metaDescription = input.metaDescription.trim();
  if (metaDescription && (metaDescription.length < 50 || metaDescription.length > 300)) {
    return `The SEO description override is ${metaDescription.length} characters; aim for 50-300 so it reads well as a search snippet. Leave it blank to use the ${input.table === "blog_posts" ? "excerpt" : "description"} instead.`;
  }

  const metaTitle = input.metaTitle.trim();
  const checks: { column: "title" | "meta_title"; value: string; label: string }[] = [
    { column: "title", value: title, label: "title" },
    ...(metaTitle ? [{ column: "meta_title" as const, value: metaTitle, label: "SEO title override" }] : []),
  ];

  for (const check of checks) {
    let query = supabase.from(input.table).select("id").eq(check.column, check.value).eq("status", "published");
    if (input.excludeId) query = query.neq("id", input.excludeId);
    const { data, error } = await query.limit(1);
    if (error) continue; // a validation-check failure should never block a real publish
    if (data && data.length > 0) {
      return `Another published ${RECORD_LABEL[input.table]} already uses this ${check.label}. Titles should be unique so search engines and readers can tell pages apart.`;
    }
  }

  return null;
}
