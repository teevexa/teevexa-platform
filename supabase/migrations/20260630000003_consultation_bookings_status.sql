-- Add status tracking to consultation_bookings
alter table consultation_bookings
  add column if not exists status text not null default 'upcoming';

-- status values: upcoming | completed | no_show | cancelled

create index if not exists idx_consultation_bookings_status on consultation_bookings(status);
create index if not exists idx_consultation_bookings_date   on consultation_bookings(selected_date);
