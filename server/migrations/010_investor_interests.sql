-- Migration 010: Investor interests table for "Indicate Interest" flow
CREATE TABLE IF NOT EXISTS investor_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    deal_slug VARCHAR(100) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    timeline VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investor_interests_investor ON investor_interests(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_deal ON investor_interests(deal_slug);

ALTER TABLE investor_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_investor_interests" ON investor_interests FOR ALL USING (true) WITH CHECK (true);
