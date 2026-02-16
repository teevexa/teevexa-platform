-- Create storage bucket for project inquiry attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('project-attachments', 'project-attachments', false);

-- Allow anyone to upload files (anon insert)
CREATE POLICY "Anyone can upload project attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-attachments');

-- Allow anyone to read their uploaded files by path
CREATE POLICY "Anyone can read project attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-attachments');

-- Add attachment_urls column to project_inquiries
ALTER TABLE public.project_inquiries
ADD COLUMN attachment_urls text[] DEFAULT '{}'::text[];