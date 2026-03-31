-- Migration 011: Add target_hold_period and key_concerns to investors
ALTER TABLE investors ADD COLUMN IF NOT EXISTS target_hold_period VARCHAR(50);
ALTER TABLE investors ADD COLUMN IF NOT EXISTS key_concerns VARCHAR(100);
