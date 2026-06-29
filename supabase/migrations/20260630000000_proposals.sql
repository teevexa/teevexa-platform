-- Proposals table: admin creates proposals, clients approve/reject
create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references client_projects(id) on delete set null,
  title text not null,
  summary text,
  scope text,
  amount numeric,
  currency text not null default 'USD',
  status text not null default 'draft',
  -- status: draft | sent | approved | rejected
  notes text,
  valid_until date,
  sent_at timestamptz,
  responded_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table proposals enable row level security;

-- Clients read their own proposals
create policy "clients_view_own_proposals" on proposals
  for select using (auth.uid() = client_id);

-- Clients can update status only (approve / reject)
create policy "clients_respond_to_proposals" on proposals
  for update using (auth.uid() = client_id)
  with check (auth.uid() = client_id and status in ('approved', 'rejected'));

-- Internal team: full access
create policy "team_manage_proposals" on proposals
  for all using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
        and role in ('super_admin', 'admin', 'project_manager')
    )
  );
