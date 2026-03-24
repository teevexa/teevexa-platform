
-- 1. assigned_developers junction table
CREATE TABLE public.project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'developer',
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid,
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assignments" ON public.project_assignments
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage assignments" ON public.project_assignments
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Users can view own assignments" ON public.project_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2. project_tasks table
CREATE TABLE public.project_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid,
  created_by uuid,
  due_date date,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage tasks" ON public.project_tasks
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage tasks" ON public.project_tasks
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Assigned users can view and update tasks" ON public.project_tasks
  FOR SELECT TO authenticated
  USING (auth.uid() = assigned_to);

CREATE POLICY "Assigned users can update own tasks" ON public.project_tasks
  FOR UPDATE TO authenticated
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Developers can view project tasks" ON public.project_tasks
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'developer'));

-- 3. project_notes / feedback table
CREATE TABLE public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  content text NOT NULL,
  note_type text NOT NULL DEFAULT 'feedback',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage notes" ON public.project_notes
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage notes" ON public.project_notes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Developers can view project notes" ON public.project_notes
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Authors can insert notes" ON public.project_notes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Clients can view own project notes" ON public.project_notes
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM client_projects WHERE id = project_notes.project_id AND user_id = auth.uid()
  ));

-- Add updated_at trigger for tasks
CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
