-- =====================================================
-- Gray Capital Deal Room — Database Schema v1.0
-- Run this in Supabase SQL Editor (or via psql)
-- =====================================================

-- =========================
-- TABLE: deals
-- =========================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft', 'live', 'closed')),
    property_address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    total_units INTEGER CHECK (total_units > 0),
    total_raise DECIMAL(15,2) CHECK (total_raise > 0),
    min_investment DECIMAL(15,2) CHECK (min_investment > 0),
    purchase_price DECIMAL(15,2) CHECK (purchase_price > 0),
    projected_hold_years INTEGER CHECK (projected_hold_years BETWEEN 1 AND 30),
    target_irr_base DECIMAL(5,4) CHECK (target_irr_base BETWEEN 0 AND 1),
    target_equity_multiple DECIMAL(5,2) CHECK (target_equity_multiple >= 1),
    target_coc DECIMAL(5,4) CHECK (target_coc BETWEEN 0 AND 1),
    -- JSONB data blobs
    sensitivity_data JSONB,      -- full sensitivity_data.json from Excel model
    waterfall_terms JSONB,       -- pref rate, splits, hurdles
    cost_seg_data JSONB,         -- cost seg estimates
    deal_terms JSONB,            -- loan, LTV, rate, etc.
    unit_mix JSONB,              -- array of unit types with counts, sf, rents
    benchmark_rates JSONB,       -- savings, treasury, muni, sp500 at deal launch
    -- Content
    hero_image_url TEXT,
    video_url TEXT,
    market_analysis_md TEXT,
    business_plan_md TEXT,
    team_override_md TEXT,
    -- Fundraise
    fundraise_pct DECIMAL(5,2) CHECK (fundraise_pct IS NULL OR fundraise_pct BETWEEN 0 AND 100),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TABLE: deal_media
-- =========================
CREATE TABLE IF NOT EXISTS deal_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('photo', 'video', 'document', 'floor_plan')),
    url TEXT NOT NULL,
    caption TEXT,
    category VARCHAR(50)
        CHECK (category IN ('exterior', 'interior', 'amenity', 'renovation', 'progress', 'aerial', 'other')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TABLE: investors
-- =========================
CREATE TABLE IF NOT EXISTS investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hubspot_contact_id VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    investment_goal VARCHAR(50)
        CHECK (investment_goal IS NULL OR investment_goal IN ('cash_flow', 'appreciation', 'tax_benefits', 'diversification')),
    syndication_experience VARCHAR(50)
        CHECK (syndication_experience IS NULL OR syndication_experience IN ('first_time', '1_to_3', '4_plus')),
    target_range VARCHAR(50)
        CHECK (target_range IS NULL OR target_range IN ('100k_250k', '250k_500k', '500k_1m', '1m_plus')),
    lead_source VARCHAR(50)
        CHECK (lead_source IS NULL OR lead_source IN ('podcast', 'referral', 'social_media', 'web_search', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TABLE: sessions
-- =========================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    total_seconds INTEGER DEFAULT 0 CHECK (total_seconds >= 0),
    sections_viewed TEXT[] DEFAULT '{}',
    chat_message_count INTEGER DEFAULT 0 CHECK (chat_message_count >= 0),
    financial_explorer_used BOOLEAN DEFAULT FALSE,
    video_watched_pct DECIMAL(5,2) DEFAULT 0 CHECK (video_watched_pct BETWEEN 0 AND 100),
    engagement_score DECIMAL(7,2) DEFAULT 0 CHECK (engagement_score >= 0)
);

-- =========================
-- TABLE: chat_messages
-- =========================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    hubspot_properties_extracted JSONB,
    kb_modules_loaded TEXT[],     -- track which KB files were used for this response
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TABLE: testimonials
-- =========================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    quote TEXT NOT NULL,
    deals_invested INTEGER CHECK (deals_invested >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- =========================
-- TABLE: knowledge_base_files
-- =========================
CREATE TABLE IF NOT EXISTS knowledge_base_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) CHECK (category IN ('firm', 'faq', 'reference', 'deal')),
    deal_slug VARCHAR(100),       -- NULL for firm-wide files
    title VARCHAR(255),
    token_count INTEGER CHECK (token_count >= 0),
    last_hash VARCHAR(64),        -- SHA-256 for change detection
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- TABLE: analytics_events (granular event log)
-- =========================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- page_view, section_view, spoke_click, slider_adjust, video_play, cta_click
    section VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX IF NOT EXISTS idx_deals_slug ON deals(slug);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_sessions_investor ON sessions(investor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_deal ON sessions(deal_id);
CREATE INDEX IF NOT EXISTS idx_sessions_engagement ON sessions(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_media_deal ON deal_media(deal_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_kb_files_path ON knowledge_base_files(file_path);

-- =========================
-- TRIGGER: auto-update updated_at on deals
-- =========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =========================
-- ROW LEVEL SECURITY
-- =========================
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Service role gets full access (backend uses service key)
CREATE POLICY "service_role_deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_deal_media" ON deal_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_investors" ON investors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_testimonials" ON testimonials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_kb_files" ON knowledge_base_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_analytics" ON analytics_events FOR ALL USING (true) WITH CHECK (true);
