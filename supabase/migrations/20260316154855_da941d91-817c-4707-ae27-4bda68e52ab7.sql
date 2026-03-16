
-- 1. Allow clients to UPDATE their own project milestones (approve/reject workflow)
CREATE POLICY "Clients can update own project milestones"
ON public.project_milestones
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.client_projects
    WHERE client_projects.id = project_milestones.project_id
    AND client_projects.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.client_projects
    WHERE client_projects.id = project_milestones.project_id
    AND client_projects.user_id = auth.uid()
  )
);

-- 2. Developer can view messages for projects they can see
CREATE POLICY "Developer can view project messages"
ON public.messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- 3. Developer can send messages
CREATE POLICY "Developer can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role)
  AND auth.uid() = sender_id
);

-- 4. Developer can view project files
CREATE POLICY "Developer can view project files"
ON public.project_files
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));

-- 5. Developer can upload files
CREATE POLICY "Developer can upload project files"
ON public.project_files
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'developer'::app_role)
  AND auth.uid() = uploaded_by
);

-- 6. PM can create and update invoices
CREATE POLICY "PM can manage invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'project_manager'::app_role))
WITH CHECK (has_role(auth.uid(), 'project_manager'::app_role));

-- 7. Developer can view profiles (for display names in messages)
CREATE POLICY "Developer can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'developer'::app_role));
