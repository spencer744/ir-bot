-- Migration 009: Add ppm_requested and interest_indicated flags to sessions
-- + Add deal_slug column to analytics_events for pagination index

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ppm_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS interest_indicated BOOLEAN DEFAULT FALSE;

-- Add deal_slug to analytics_events if not present (needed for Chunk G index)
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS deal_slug VARCHAR(100);
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS investor_id UUID;
