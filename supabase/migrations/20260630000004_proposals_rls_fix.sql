-- Fix proposals RLS: split 'for all' into explicit per-operation policies
-- so PostgREST can correctly evaluate INSERT/UPDATE with check expressions.

drop policy if exists "team_manage_proposals" on proposals;

create policy "team_select_proposals" on proposals
  for select using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  );

create policy "team_insert_proposals" on proposals
  for insert with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  );

create policy "team_update_proposals" on proposals
  for update using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  ) with check (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  );

create policy "team_delete_proposals" on proposals
  for delete using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  );
