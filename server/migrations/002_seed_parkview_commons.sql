-- =====================================================
-- Seed Data: Parkview Commons Demo Deal
-- Run after 001_initial_schema.sql
-- =====================================================

-- =========================
-- SEED: Parkview Commons Deal
-- =========================
INSERT INTO deals (
    id, slug, name, status,
    property_address, city, state,
    total_units, total_raise, min_investment, purchase_price,
    projected_hold_years, target_irr_base, target_equity_multiple, target_coc,
    sensitivity_data, waterfall_terms, cost_seg_data, deal_terms,
    unit_mix, benchmark_rates,
    hero_image_url, video_url,
    market_analysis_md, business_plan_md,
    fundraise_pct
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'parkview-commons',
    'Parkview Commons',
    'live',
    '1200 Parkview Drive, Indianapolis, IN 46220',
    'Indianapolis',
    'IN',
    312,
    15000000.00,
    100000.00,
    42000000.00,
    5,
    0.1580,
    1.95,
    0.0720,

    -- sensitivity_data (full JSON blob)
    '{
      "deal_slug": "parkview-commons",
      "scenarios": {
        "downside": {
          "label": "Conservative",
          "assumptions": {
            "annual_rent_growth": 0.020,
            "exit_cap": 0.058,
            "avg_occupancy": 0.91,
            "annual_expense_growth": 0.035
          }
        },
        "base": {
          "label": "Base",
          "assumptions": {
            "annual_rent_growth": 0.035,
            "exit_cap": 0.053,
            "avg_occupancy": 0.94,
            "annual_expense_growth": 0.030
          }
        },
        "upside": {
          "label": "Upside",
          "assumptions": {
            "annual_rent_growth": 0.045,
            "exit_cap": 0.048,
            "avg_occupancy": 0.96,
            "annual_expense_growth": 0.025
          }
        },
        "strategic": {
          "label": "Strategic",
          "assumptions": {
            "annual_rent_growth": 0.055,
            "exit_cap": 0.045,
            "avg_occupancy": 0.97,
            "annual_expense_growth": 0.025
          }
        }
      },
      "sensitivity_tables": {
        "rent_growth_vs_irr": [
          {"rent_growth": 0.000, "irr": 0.082, "equity_multiple": 1.45, "avg_coc": 0.051},
          {"rent_growth": 0.005, "irr": 0.091, "equity_multiple": 1.52, "avg_coc": 0.055},
          {"rent_growth": 0.010, "irr": 0.101, "equity_multiple": 1.59, "avg_coc": 0.058},
          {"rent_growth": 0.015, "irr": 0.110, "equity_multiple": 1.66, "avg_coc": 0.062},
          {"rent_growth": 0.020, "irr": 0.120, "equity_multiple": 1.73, "avg_coc": 0.065},
          {"rent_growth": 0.025, "irr": 0.130, "equity_multiple": 1.80, "avg_coc": 0.068},
          {"rent_growth": 0.030, "irr": 0.142, "equity_multiple": 1.88, "avg_coc": 0.070},
          {"rent_growth": 0.035, "irr": 0.158, "equity_multiple": 1.95, "avg_coc": 0.072},
          {"rent_growth": 0.040, "irr": 0.172, "equity_multiple": 2.05, "avg_coc": 0.075},
          {"rent_growth": 0.045, "irr": 0.188, "equity_multiple": 2.16, "avg_coc": 0.078},
          {"rent_growth": 0.050, "irr": 0.205, "equity_multiple": 2.28, "avg_coc": 0.081}
        ],
        "exit_cap_vs_irr": [
          {"exit_cap": 0.040, "irr": 0.225, "equity_multiple": 2.50},
          {"exit_cap": 0.043, "irr": 0.205, "equity_multiple": 2.32},
          {"exit_cap": 0.045, "irr": 0.192, "equity_multiple": 2.20},
          {"exit_cap": 0.048, "irr": 0.175, "equity_multiple": 2.08},
          {"exit_cap": 0.050, "irr": 0.165, "equity_multiple": 2.00},
          {"exit_cap": 0.053, "irr": 0.158, "equity_multiple": 1.95},
          {"exit_cap": 0.055, "irr": 0.145, "equity_multiple": 1.85},
          {"exit_cap": 0.058, "irr": 0.130, "equity_multiple": 1.75},
          {"exit_cap": 0.060, "irr": 0.118, "equity_multiple": 1.68},
          {"exit_cap": 0.065, "irr": 0.095, "equity_multiple": 1.52},
          {"exit_cap": 0.070, "irr": 0.072, "equity_multiple": 1.38}
        ],
        "occupancy_vs_irr": [
          {"occupancy": 0.85, "irr": 0.065, "equity_multiple": 1.32},
          {"occupancy": 0.87, "irr": 0.082, "equity_multiple": 1.42},
          {"occupancy": 0.89, "irr": 0.100, "equity_multiple": 1.55},
          {"occupancy": 0.91, "irr": 0.120, "equity_multiple": 1.68},
          {"occupancy": 0.93, "irr": 0.142, "equity_multiple": 1.82},
          {"occupancy": 0.94, "irr": 0.158, "equity_multiple": 1.95},
          {"occupancy": 0.95, "irr": 0.168, "equity_multiple": 2.02},
          {"occupancy": 0.96, "irr": 0.180, "equity_multiple": 2.12},
          {"occupancy": 0.97, "irr": 0.195, "equity_multiple": 2.22},
          {"occupancy": 0.98, "irr": 0.210, "equity_multiple": 2.32}
        ],
        "rent_growth_x_exit_cap": [
          {"rent_growth": 0.020, "exit_cap": 0.045, "irr": 0.155},
          {"rent_growth": 0.020, "exit_cap": 0.050, "irr": 0.135},
          {"rent_growth": 0.020, "exit_cap": 0.055, "irr": 0.115},
          {"rent_growth": 0.020, "exit_cap": 0.060, "irr": 0.095},
          {"rent_growth": 0.035, "exit_cap": 0.045, "irr": 0.195},
          {"rent_growth": 0.035, "exit_cap": 0.050, "irr": 0.172},
          {"rent_growth": 0.035, "exit_cap": 0.053, "irr": 0.158},
          {"rent_growth": 0.035, "exit_cap": 0.060, "irr": 0.128},
          {"rent_growth": 0.045, "exit_cap": 0.045, "irr": 0.228},
          {"rent_growth": 0.045, "exit_cap": 0.048, "irr": 0.210},
          {"rent_growth": 0.045, "exit_cap": 0.053, "irr": 0.185},
          {"rent_growth": 0.045, "exit_cap": 0.060, "irr": 0.152}
        ]
      },
      "annual_cash_flows": {
        "downside": {
          "year_1": {"noi": 2380000, "debt_service": 2020000, "cash_flow_to_equity": 180000, "distribution_per_unit": 577},
          "year_2": {"noi": 2520000, "debt_service": 2020000, "cash_flow_to_equity": 350000, "distribution_per_unit": 1122},
          "year_3": {"noi": 2650000, "debt_service": 2020000, "cash_flow_to_equity": 520000, "distribution_per_unit": 1667},
          "year_4": {"noi": 2720000, "debt_service": 2020000, "cash_flow_to_equity": 580000, "distribution_per_unit": 1859},
          "year_5": {"noi": 2790000, "debt_service": 2020000, "cash_flow_to_equity": 640000, "distribution_per_unit": 2051}
        },
        "base": {
          "year_1": {"noi": 2450000, "debt_service": 2020000, "cash_flow_to_equity": 280000, "distribution_per_unit": 897},
          "year_2": {"noi": 2680000, "debt_service": 2020000, "cash_flow_to_equity": 520000, "distribution_per_unit": 1667},
          "year_3": {"noi": 2920000, "debt_service": 2020000, "cash_flow_to_equity": 750000, "distribution_per_unit": 2404},
          "year_4": {"noi": 3050000, "debt_service": 2020000, "cash_flow_to_equity": 860000, "distribution_per_unit": 2756},
          "year_5": {"noi": 3180000, "debt_service": 2020000, "cash_flow_to_equity": 970000, "distribution_per_unit": 3109}
        },
        "upside": {
          "year_1": {"noi": 2500000, "debt_service": 2020000, "cash_flow_to_equity": 330000, "distribution_per_unit": 1058},
          "year_2": {"noi": 2800000, "debt_service": 2020000, "cash_flow_to_equity": 640000, "distribution_per_unit": 2051},
          "year_3": {"noi": 3100000, "debt_service": 2020000, "cash_flow_to_equity": 920000, "distribution_per_unit": 2949},
          "year_4": {"noi": 3300000, "debt_service": 2020000, "cash_flow_to_equity": 1100000, "distribution_per_unit": 3526},
          "year_5": {"noi": 3500000, "debt_service": 2020000, "cash_flow_to_equity": 1280000, "distribution_per_unit": 4103}
        },
        "strategic": {
          "year_1": {"noi": 2550000, "debt_service": 2020000, "cash_flow_to_equity": 380000, "distribution_per_unit": 1218},
          "year_2": {"noi": 2920000, "debt_service": 2020000, "cash_flow_to_equity": 750000, "distribution_per_unit": 2404},
          "year_3": {"noi": 3300000, "debt_service": 2020000, "cash_flow_to_equity": 1100000, "distribution_per_unit": 3526},
          "year_4": {"noi": 3550000, "debt_service": 2020000, "cash_flow_to_equity": 1330000, "distribution_per_unit": 4263},
          "year_5": {"noi": 3820000, "debt_service": 2020000, "cash_flow_to_equity": 1560000, "distribution_per_unit": 5000}
        }
      }
    }'::jsonb,

    -- waterfall_terms
    '{
      "pref_rate": 0.08,
      "pref_type": "cumulative",
      "pref_basis": "committed_capital",
      "hurdle_1_irr": null,
      "split_below_hurdle": {"lp": 1.0, "gp": 0.0},
      "hurdle_1_rate": 0.15,
      "split_above_hurdle_1": {"lp": 0.70, "gp": 0.30},
      "catch_up": false
    }'::jsonb,

    -- cost_seg_data
    '{
      "year_1_accelerated_depreciation_pct": 0.60,
      "total_depreciable_basis": 35000000,
      "estimated_year_1_paper_loss_per_100k": 82000
    }'::jsonb,

    -- deal_terms
    '{
      "total_raise": 15000000,
      "min_investment": 100000,
      "projected_hold_years": 5,
      "purchase_price": 42000000,
      "total_units": 312,
      "loan_amount": 29400000,
      "interest_rate": 0.055,
      "ltv": 0.70,
      "loan_type": "Agency (Freddie Mac)",
      "amortization_years": 30,
      "io_period_months": 24
    }'::jsonb,

    -- unit_mix
    '[
      {"type": "1 BR / 1 BA", "count": 96,  "avg_sf": 725,  "current_rent": 985,  "pro_forma_rent": 1175},
      {"type": "2 BR / 1 BA", "count": 72,  "avg_sf": 925,  "current_rent": 1125, "pro_forma_rent": 1325},
      {"type": "2 BR / 2 BA", "count": 108, "avg_sf": 1050, "current_rent": 1250, "pro_forma_rent": 1450},
      {"type": "3 BR / 2 BA", "count": 36,  "avg_sf": 1275, "current_rent": 1425, "pro_forma_rent": 1650}
    ]'::jsonb,

    -- benchmark_rates
    '{
      "savings": 0.045,
      "treasury_10yr": 0.042,
      "muni_bond": 0.035,
      "sp500_avg": 0.10,
      "as_of": "2026-03-01"
    }'::jsonb,

    -- hero_image_url (empty for now — team will upload)
    '',
    -- video_url (empty for now)
    '',

    -- market_analysis_md
    'Indianapolis is the 33rd largest MSA in the United States with a population of over 2.1 million. The metro has experienced steady growth driven by a diversified employment base anchored by healthcare (Eli Lilly, IU Health), logistics (FedEx, Amazon), technology (Salesforce, Infosys), and education (Indiana University, Purdue).

The northeast submarket where Parkview Commons is located benefits from proximity to major employment centers along the I-465 corridor, strong school districts, and limited new multifamily supply. Current submarket vacancy is 4.2%, well below the national average of 6.8%.

Rent growth in the Indianapolis MSA has averaged 4.1% annually over the past three years, with the northeast submarket outperforming at 4.6%. New supply in the submarket is limited to 180 units currently under construction, compared to trailing 12-month absorption of 420 units.

Key employment drivers include:
- Healthcare: Eli Lilly ($40B+ market cap), IU Health (35,000+ employees), Roche Diagnostics
- Logistics: FedEx hub, Amazon fulfillment centers, Indianapolis International Airport cargo operations
- Technology: Salesforce Tower (2,000+ employees), Infosys (3,000+ planned), tech startup ecosystem
- Education: Indiana University, Purdue University, Butler University
- Government: State capital with stable government employment base

The Indianapolis MSA has added 28,000+ jobs over the past 12 months, with unemployment at 3.1% vs. 3.7% nationally.',

    -- business_plan_md
    'Parkview Commons presents a classic Midwest value-add opportunity. The property was built in 2001 and has received minimal capital investment over the past decade. Current rents are 12-15% below renovated comparables in the immediate submarket.

Our business plan centers on a $22,000 per unit interior renovation and a $2.5M exterior improvement program:

**Interior Renovation ($22,000/unit):**
- Quartz countertops and tile backsplash
- New shaker-style cabinets
- Stainless steel appliance package
- Luxury vinyl plank flooring throughout
- Updated lighting fixtures and hardware
- Modern two-tone paint scheme
- New bathroom vanities and fixtures

**Exterior & Common Area ($2.5M):**
- Monument signage and wayfinding
- Landscaping redesign with outdoor gathering areas
- Dog park with agility features
- Fitness center expansion and equipment upgrade
- Clubhouse renovation with coworking space
- Pool area refresh and furniture
- LED lighting throughout parking and pathways

**Operational Improvements:**
- Gray Residential takeover at close — in-house management
- Revenue management system implementation
- Resident retention programs (renewal incentives, community events)
- Utility submeter installation (RUBS program)
- Smart home technology package (smart locks, thermostats)

**Timeline:**
- Months 1-2: Close and transition to Gray Residential
- Months 3-18: Renovate 15-20 units/month while maintaining 92%+ occupancy
- Months 18-24: Complete renovations, stabilize at target rents
- Years 3-5: Optimize operations, quarterly distributions, monitor exit timing

Post-renovation, we target an average rent premium of $175-$225/unit, consistent with renovated comps.',

    -- fundraise_pct (null — not yet activated)
    NULL
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    sensitivity_data = EXCLUDED.sensitivity_data,
    waterfall_terms = EXCLUDED.waterfall_terms,
    cost_seg_data = EXCLUDED.cost_seg_data,
    deal_terms = EXCLUDED.deal_terms,
    unit_mix = EXCLUDED.unit_mix,
    market_analysis_md = EXCLUDED.market_analysis_md,
    business_plan_md = EXCLUDED.business_plan_md,
    updated_at = NOW();


-- =========================
-- SEED: Sample Testimonials
-- =========================
INSERT INTO testimonials (name, title, quote, deals_invested, is_active, sort_order) VALUES
(
    'Dr. Michael Chen',
    'Physician, LP since 2022',
    'Gray Capital has been a game-changer for my portfolio. The quarterly reports are incredibly detailed, and the returns have consistently met or exceeded projections. Spencer and the team are the real deal.',
    3,
    true,
    1
),
(
    'Sarah Thompson',
    'Tech Executive, LP since 2021',
    'I''ve invested in four Gray Capital deals now. What sets them apart is the transparency — they show you the Conservative case right alongside the Upside, and they''ve been honest about challenges when they arise. That builds real trust.',
    4,
    true,
    2
),
(
    'James & Linda Patel',
    'Business Owners, LP since 2023',
    'The tax benefits alone made our first investment worthwhile. The cost segregation study generated significant paper losses in year one. Combined with the cash flow and appreciation, it''s been an excellent addition to our portfolio.',
    2,
    true,
    3
),
(
    'Robert Williams',
    'Retired Attorney, LP since 2020',
    'After 30 years in law, I''ve reviewed a lot of offering documents. Gray Capital''s are among the clearest and most straightforward I''ve seen. No hidden fees, no catch-up provisions, and they invest alongside us in every deal.',
    5,
    true,
    4
)
ON CONFLICT DO NOTHING;


-- =========================
-- SEED: Knowledge Base File Metadata
-- =========================
INSERT INTO knowledge_base_files (file_path, category, deal_slug, title, token_count) VALUES
-- Firm-wide
('firm/history-and-mission.md', 'firm', NULL, 'Gray Capital History & Mission', 800),
('firm/investment-philosophy-deep.md', 'firm', NULL, 'Investment Philosophy Deep Dive', 1200),
('firm/team-spencer-gray.md', 'firm', NULL, 'Spencer Gray Bio', 600),
('firm/team-leadership.md', 'firm', NULL, 'Leadership Team', 500),
('firm/team-gray-residential.md', 'firm', NULL, 'Gray Residential Team', 500),
('firm/track-record-full.md', 'firm', NULL, 'Full Track Record', 1500),
('firm/track-record-case-studies.md', 'firm', NULL, 'Deal Case Studies', 1500),
('firm/investor-experience.md', 'firm', NULL, 'LP Experience Guide', 800),
('firm/lp-testimonials.md', 'firm', NULL, 'LP Testimonials', 500),
('firm/gray-residential-ops.md', 'firm', NULL, 'Gray Residential Operations', 1000),
-- FAQ
('faq/faq-general.md', 'faq', NULL, 'General FAQ', 800),
('faq/faq-returns-distributions.md', 'faq', NULL, 'Returns & Distributions FAQ', 1000),
('faq/faq-tax-depreciation.md', 'faq', NULL, 'Tax & Depreciation FAQ', 1000),
('faq/faq-risk-downside.md', 'faq', NULL, 'Risk & Downside FAQ', 800),
('faq/faq-fees-structure.md', 'faq', NULL, 'Fees & Structure FAQ', 700),
('faq/faq-liquidity-exit.md', 'faq', NULL, 'Liquidity & Exit FAQ', 600),
('faq/faq-process-timeline.md', 'faq', NULL, 'Process & Timeline FAQ', 600),
-- Reference
('reference/ref-syndication-101.md', 'reference', NULL, 'Syndication 101', 1200),
('reference/ref-understanding-returns.md', 'reference', NULL, 'Understanding Returns', 800),
('reference/ref-accredited-investor.md', 'reference', NULL, 'Accredited Investor Guide', 500),
-- Deal-specific
('deal/parkview-commons/deal-overview.md', 'deal', 'parkview-commons', 'Parkview Commons Overview', 500),
('deal/parkview-commons/property-details.md', 'deal', 'parkview-commons', 'Property Details', 800),
('deal/parkview-commons/market-analysis.md', 'deal', 'parkview-commons', 'Market Analysis', 1000),
('deal/parkview-commons/business-plan.md', 'deal', 'parkview-commons', 'Business Plan', 800),
('deal/parkview-commons/financial-summary.md', 'deal', 'parkview-commons', 'Financial Summary', 1000),
('deal/parkview-commons/terms-and-fees.md', 'deal', 'parkview-commons', 'Terms & Fees', 600),
('deal/parkview-commons/cost-seg-tax.md', 'deal', 'parkview-commons', 'Cost Segregation & Tax', 600),
('deal/parkview-commons/sensitivity-context.md', 'deal', 'parkview-commons', 'Sensitivity Analysis Context', 700)
ON CONFLICT (file_path) DO UPDATE SET
    token_count = EXCLUDED.token_count,
    updated_at = NOW();
