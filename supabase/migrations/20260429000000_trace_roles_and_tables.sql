-- Add Teevexa Trace roles to the app_role enum.
-- Must be in its own migration because PostgreSQL does not allow a newly added
-- enum value to be referenced in the same transaction that added it.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'trace_client';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'field_agent';
