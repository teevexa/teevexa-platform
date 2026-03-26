
-- Deliverables table for approval workflows
CREATE TABLE public.deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.client_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  file_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by UUID NOT NULL,
  reviewed_by UUID,
  review_comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deliverables" ON public.deliverables FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage deliverables" ON public.deliverables FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Developers can manage deliverables" ON public.deliverables FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'developer'));

CREATE POLICY "Clients can view own project deliverables" ON public.deliverables FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM client_projects WHERE client_projects.id = deliverables.project_id AND client_projects.user_id = auth.uid()));

CREATE POLICY "Clients can update own project deliverables" ON public.deliverables FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM client_projects WHERE client_projects.id = deliverables.project_id AND client_projects.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM client_projects WHERE client_projects.id = deliverables.project_id AND client_projects.user_id = auth.uid()));

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage support tickets" ON public.support_tickets FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage support tickets" ON public.support_tickets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ticket replies table
CREATE TABLE public.ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage ticket replies" ON public.ticket_replies FOR ALL TO public
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "PM can manage ticket replies" ON public.ticket_replies FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'project_manager'));

CREATE POLICY "Users can insert replies to own tickets" ON public.ticket_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view replies to own tickets" ON public.ticket_replies FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_replies.ticket_id AND support_tickets.user_id = auth.uid()));

CREATE POLICY "Staff can view replies" ON public.ticket_replies FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'project_manager'));

-- Trigger for updated_at on support_tickets
CREATE TRIGGER set_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
