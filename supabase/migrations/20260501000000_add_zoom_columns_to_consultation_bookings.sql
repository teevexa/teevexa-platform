ALTER TABLE consultation_bookings
  ADD COLUMN IF NOT EXISTS zoom_meeting_id  text,
  ADD COLUMN IF NOT EXISTS zoom_join_url    text,
  ADD COLUMN IF NOT EXISTS zoom_start_url   text;
