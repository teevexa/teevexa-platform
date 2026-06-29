-- Meeting notes: admin writes, clients read
create table if not exists meeting_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references client_projects(id) on delete cascade not null,
  title text not null,
  meeting_date date not null,
  attendees text[] not null default '{}',
  summary text not null,
  action_items text[] not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table meeting_notes enable row level security;

-- Clients can read notes for their projects
create policy "clients_view_meeting_notes" on meeting_notes
  for select using (
    exists (
      select 1 from client_projects
      where id = meeting_notes.project_id
        and user_id = auth.uid()
    )
  );

-- Internal team: full access
create policy "team_manage_meeting_notes" on meeting_notes
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager', 'developer')
    )
  );
