-- Add user_id linkage and status tracking to project_inquiries
alter table project_inquiries
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists status text not null default 'new';

-- Index for fast admin queries by status and user
create index if not exists idx_project_inquiries_user_id on project_inquiries(user_id);
create index if not exists idx_project_inquiries_status  on project_inquiries(status);
