
-- Time tracking entries table
CREATE TABLE public.time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  description text,
  hours numeric(6,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Admins/super_admins full access
CREATE POLICY "Admins can manage time entries" ON public.time_entries
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- PM full access
CREATE POLICY "PM can manage time entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

-- Users can manage own entries
CREATE POLICY "Users can manage own time entries" ON public.time_entries
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Developers can view all time entries
CREATE POLICY "Developers can view time entries" ON public.time_entries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'developer'));
