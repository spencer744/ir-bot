-- Migration 012: Add composite index for deal events pagination
CREATE INDEX IF NOT EXISTS idx_deal_events_deal_slug ON analytics_events(deal_slug, created_at DESC);
