-- Optional fees JSONB for deal-specific fee display (e.g. acquisition, AM, PM, disposition)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS fees JSONB;
