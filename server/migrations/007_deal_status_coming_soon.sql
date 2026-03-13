-- Add 'coming_soon' to deals.status so deals can be visible with a "coming soon" banner
-- Run in Supabase SQL Editor after 001-006

ALTER TABLE deals
  DROP CONSTRAINT IF EXISTS deals_status_check;

ALTER TABLE deals
  ADD CONSTRAINT deals_status_check
  CHECK (status IN ('draft', 'coming_soon', 'live', 'closed'));
