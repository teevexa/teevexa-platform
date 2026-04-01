
-- Create a public storage bucket for portfolio cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);

-- Allow authenticated admins/super_admins to upload portfolio images
CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow authenticated admins/super_admins to update portfolio images
CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow authenticated admins/super_admins to delete portfolio images
CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
);

-- Allow anyone to view portfolio images (public bucket)
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio-images');
