
-- Fix overly permissive notifications insert policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role) OR 
  has_role(auth.uid(), 'project_manager'::app_role) OR
  has_role(auth.uid(), 'developer'::app_role) OR
  auth.uid() = user_id
);
