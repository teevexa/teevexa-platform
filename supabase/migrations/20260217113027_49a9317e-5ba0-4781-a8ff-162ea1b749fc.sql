
-- Project files table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project files" ON public.project_files
FOR SELECT USING (
  EXISTS (SELECT 1 FROM client_projects WHERE id = project_files.project_id AND user_id = auth.uid())
);
CREATE POLICY "Users can upload to own projects" ON public.project_files
FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (SELECT 1 FROM client_projects WHERE id = project_files.project_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all files" ON public.project_files
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);

-- Jobs table for careers
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL DEFAULT 'full-time',
  description TEXT NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  benefits TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open jobs" ON public.jobs
FOR SELECT USING (status = 'open');
CREATE POLICY "Admins can manage jobs" ON public.jobs
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  portfolio TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit applications" ON public.job_applications
FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage applications" ON public.job_applications
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Teevexa Trace waitlist
CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist" ON public.waitlist_signups
FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view waitlist" ON public.waitlist_signups
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add columns to client_projects
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS assigned_pm UUID;
ALTER TABLE public.client_projects ADD COLUMN IF NOT EXISTS budget TEXT;

-- Create resume storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Admins can view resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
));

-- Update existing admin policies to include super_admin
DROP POLICY IF EXISTS "Admins can manage all projects" ON public.client_projects;
CREATE POLICY "Admins can manage all projects" ON public.client_projects
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices" ON public.invoices
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage messages" ON public.messages;
CREATE POLICY "Admins can manage messages" ON public.messages
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage milestones" ON public.project_milestones;
CREATE POLICY "Admins can manage milestones" ON public.project_milestones
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
