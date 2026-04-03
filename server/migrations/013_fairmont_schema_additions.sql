-- =====================================================
-- Migration 013: Fairmont deal schema additions
-- Run after 012_deal_events_index.sql
-- =====================================================

-- Add fields to deals table for Fairmont-specific data
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS tax_abatement_years INTEGER,
  ADD COLUMN IF NOT EXISTS tax_abatement_end_year INTEGER,
  ADD COLUMN IF NOT EXISTS debt_io_period_months INTEGER,
  ADD COLUMN IF NOT EXISTS deal_status VARCHAR(20) DEFAULT 'active'
    CHECK (deal_status IS NULL OR deal_status IN ('active', 'closed', 'paused', 'coming_soon')),
  ADD COLUMN IF NOT EXISTS institutional_fast_track_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS target_irr_conservative DECIMAL(5,4) CHECK (target_irr_conservative IS NULL OR target_irr_conservative BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT;

-- Add token_usage tracking to sessions (for AI rate limiting)
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS token_usage INTEGER DEFAULT 0 CHECK (token_usage >= 0);

-- Add deal_fees JSONB to deals (for fee calculator)
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS deal_fees JSONB;

-- Index on deal_status for filtering
CREATE INDEX IF NOT EXISTS idx_deals_deal_status ON deals(deal_status);
CREATE INDEX IF NOT EXISTS idx_sessions_token_usage ON sessions(token_usage);
