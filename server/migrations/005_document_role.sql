-- Add document_role to deal_media for featured docs (deck, one_pager, etc.)
ALTER TABLE deal_media ADD COLUMN IF NOT EXISTS document_role VARCHAR(30);

-- Optional: create storage bucket for deal documents (run in Supabase Dashboard if using Storage)
-- Bucket name: deal-documents (public or private per your policy)
