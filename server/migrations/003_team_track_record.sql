-- Migration 003: Team & Track Record tables
-- Run after 001_initial_schema.sql and 002_seed_parkview_commons.sql

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    entity VARCHAR(100), -- 'Gray Capital', 'Gray Residential', 'Gray Construction & Design'
    photo_url TEXT,
    email VARCHAR(255),
    bio TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    display_section VARCHAR(50) DEFAULT 'leadership', -- 'leadership', 'ir'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track record table (realized + active projects)
CREATE TABLE IF NOT EXISTS track_record (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    market VARCHAR(255),
    entry_date DATE,
    exit_date DATE,
    acquired DATE, -- for active projects
    net_irr DECIMAL(5,2),
    net_equity_multiple DECIMAL(5,2),
    cash_on_cash DECIMAL(5,2),
    strategy VARCHAR(50), -- 'Value-Add', 'Core Plus', 'Opportunistic', 'Build to Rent'
    status VARCHAR(20) DEFAULT 'active', -- 'realized', 'active'
    is_fund_asset BOOLEAN DEFAULT FALSE,
    units INTEGER,
    purchase_price DECIMAL(15,2),
    year_built INTEGER,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case studies table
CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    strategy VARCHAR(50),
    market VARCHAR(255),
    units INTEGER,
    year_built INTEGER,
    purchase_price DECIMAL(15,2),
    cash_on_cash DECIMAL(5,2),
    irr VARCHAR(50),
    hold_period VARCHAR(50),
    narrative TEXT,
    image_url TEXT,
    stats JSONB, -- flexible additional stats like noi_increase, price_per_unit
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table (if not already exists from earlier migration)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    attribution VARCHAR(255),
    quote TEXT NOT NULL,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add company_data JSONB column to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS company_data JSONB;
