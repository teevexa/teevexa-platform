-- SEO override fields for blog posts and case studies.
-- Nullable and additive: existing rows keep working with auto-derived metadata
-- (title/excerpt), these columns only take effect when an editor fills them in.
-- Does not touch RLS: profiles is not involved, author_name is a free-text
-- byline set by the editor, not a join to any user's private profile data.

ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_noindex boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_name text;

ALTER TABLE public.case_studies
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_noindex boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.blog_posts.meta_title IS 'Optional override for the <title>/og:title. Falls back to title when null.';
COMMENT ON COLUMN public.blog_posts.meta_description IS 'Optional override for the meta description/og:description. Falls back to excerpt when null.';
COMMENT ON COLUMN public.blog_posts.seo_noindex IS 'Set true to keep an individual published post out of search indexing and the sitemap without unpublishing it.';
COMMENT ON COLUMN public.blog_posts.author_name IS 'Free-text byline shown and used in Article structured data. Falls back to "Teevexa" when null.';

COMMENT ON COLUMN public.case_studies.meta_title IS 'Optional override for the <title>/og:title. Falls back to title when null.';
COMMENT ON COLUMN public.case_studies.meta_description IS 'Optional override for the meta description/og:description. Falls back to description when null.';
COMMENT ON COLUMN public.case_studies.seo_noindex IS 'Set true to keep an individual published case study out of search indexing and the sitemap without unpublishing it.';
