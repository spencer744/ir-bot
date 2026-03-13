-- Add optional hero video URL for full-bleed looping background video
-- Run in Supabase SQL Editor after 001-007

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT;
