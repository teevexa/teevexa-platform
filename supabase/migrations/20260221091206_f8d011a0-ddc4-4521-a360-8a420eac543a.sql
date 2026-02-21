
-- Blog posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  cover_image_url text,
  author_id uuid,
  status text NOT NULL DEFAULT 'draft',
  tags text[] DEFAULT '{}',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fix consultation_bookings: allow admins to read
DROP POLICY IF EXISTS "Service role can read bookings" ON public.consultation_bookings;
CREATE POLICY "Admins can view consultation bookings" ON public.consultation_bookings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix contact_submissions: allow admins to read
DROP POLICY IF EXISTS "Service role can read contacts" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Fix project_inquiries: allow admins to read
DROP POLICY IF EXISTS "Service role can read inquiries" ON public.project_inquiries;
CREATE POLICY "Admins can view project inquiries" ON public.project_inquiries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- PM policies
CREATE POLICY "PM can manage all projects" ON public.client_projects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "Developer can view assigned projects" ON public.client_projects
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "PM can manage all milestones" ON public.project_milestones
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "Developer can view milestones" ON public.project_milestones
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'developer'::app_role));

CREATE POLICY "PM can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "PM can view invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "PM can view project inquiries" ON public.project_inquiries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "PM can view consultation bookings" ON public.consultation_bookings
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "PM can manage messages" ON public.messages
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

CREATE POLICY "PM can manage files" ON public.project_files
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
