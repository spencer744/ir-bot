-- =====================================================
-- Fairmont Apartments — Deal Seed Data
-- Gray Capital LLC Private Placement
-- Updated: 2026-04-09 — exact deck numbers
-- =====================================================
-- Financial assumptions:
--   Purchase price:  $62,500,000  ($285,388/unit)
--   LTV:             70%  → Debt = $43,750,000
--   Equity raise:    $22,082,000
--   Total cap:       $65,832,000
--   Hold period:     7 years
--   IRR target:      14-16% base
--   Equity multiple: 2.2x
-- =====================================================

INSERT INTO deals (
  slug,
  name,
  status,
  deal_status,
  property_address,
  city,
  state,
  total_units,
  total_raise,
  min_investment,
  purchase_price,
  projected_hold_years,
  target_irr_base,
  target_irr_conservative,
  target_equity_multiple,
  target_coc,
  tax_abatement_years,
  tax_abatement_end_year,
  debt_io_period_months,
  institutional_fast_track_enabled,
  -- JSONB data
  deal_terms,
  waterfall_terms,
  deal_fees,
  cost_seg_data,
  benchmark_rates,
  unit_mix,
  -- Timestamps
  created_at,
  updated_at
)
VALUES (
  'fairmont-apartments',
  'Fairmont Apartments',
  'live',
  'active',
  '4985 Warner Rd, Westerville, OH 43081',
  'Westerville',
  'OH',
  219,
  22082000.00,   -- equity raise
  100000.00,     -- min investment
  62500000.00,   -- purchase price
  7,             -- hold years
  0.15,          -- 15% IRR base (midpoint of 14-16%)
  0.10,          -- ~10% IRR conservative
  2.2,           -- 2.2x equity multiple
  0.084,         -- 8.4% avg cash-on-cash
  15,            -- 15-year tax abatement
  2041,          -- abatement ends 2041
  48,            -- 48-month IO period
  TRUE,          -- institutional fast track enabled
  -- deal_terms JSONB
  jsonb_build_object(
    'lender',                   'Greystone (Fannie Mae)',
    'loan_type',                'Agency',
    'loan_amount',              43750000,
    'interest_rate',            0.0517,
    'loan_term_years',          7,
    'io_period_months',         48,
    'ltv',                      0.70,
    'dscr_at_stabilization',    1.03,
    'projected_close',          '2026-06-01',
    'target_close',             '2026-06-01',
    'total_capitalization',     65832000,
    'acquisition_fee',          937500,
    'closing_reserves',         2394500,
    'purchase_price_per_unit',  285388,
    'asset_class',              'Class A Multifamily',
    'strategy',                 'Core-Plus',
    'market',                   'Columbus, OH MSA',
    'submarket',                'Westerville / New Albany',
    'developer',                'Preferred Living',
    'year_built',               2025,
    'entry_cap_rate',           0.0584,
    'exit_cap_rate',            0.0550,
    'preferred_return',         0.08,
    'target_irr_low',           0.14,
    'target_irr_high',          0.16,
    'sources_uses', jsonb_build_object(
      'sources', jsonb_build_object(
        'senior_debt',    43750000,
        'common_equity',  22082000,
        'total',          65832000
      ),
      'uses', jsonb_build_object(
        'purchase_price',   62500000,
        'acquisition_fee',  937500,
        'closing_reserves', 2394500,
        'total',            65832000
      )
    )
  ),
  -- waterfall_terms JSONB
  jsonb_build_object(
    'pref_rate',              0.08,
    'pref_type',              'cumulative_non_compounding',
    'gp_catchup',             false,
    'lp_split',               0.80,
    'gp_split',               0.20,
    'split_above_hurdle', jsonb_build_object(
      'hurdle',  0.08,
      'lp',      0.80,
      'gp',      0.20
    )
  ),
  -- deal_fees JSONB
  jsonb_build_object(
    'acquisition_fee_pct',        0.015,
    'acquisition_fee_dollars',    937500,
    'asset_mgmt_fee_pct',         0.02,
    'asset_mgmt_fee_basis',       'EGI',
    'disposition_fee_pct',        0.01,
    'disposition_fee_basis',      'sale_price',
    'construction_mgmt_fee_pct',  0.00,
    'construction_mgmt_note',     'N/A - no renovation',
    'preferred_return_pct',       0.08,
    'preferred_return_type',      'cumulative_non_compounding'
  ),
  -- cost_seg_data JSONB
  jsonb_build_object(
    'year_1_accelerated_depreciation_pct',  0.30,
    'estimated_year_1_paper_loss_per_100k', 30000,
    'study_completed',                       false,
    'note',                                  'Cost segregation study to be completed post-closing. New construction (2025) qualifies for bonus depreciation.'
  ),
  -- benchmark_rates JSONB (as of Q1 2026)
  jsonb_build_object(
    'savings_rate',     0.045,
    'treasury_10yr',    0.042,
    'muni_rate',        0.038,
    'sp500_avg_annual', 0.10
  ),
  -- unit_mix JSONB (exact deck numbers)
  jsonb_build_array(
    jsonb_build_object(
      'type',           '1BR/1BA',
      'count',          88,
      'avg_sf',         667,
      'market_rent',    1507,
      'rent_per_sf',    2.26
    ),
    jsonb_build_object(
      'type',           '2BR/2BA',
      'count',          108,
      'avg_sf',         1073,
      'market_rent',    1933,
      'rent_per_sf',    1.80
    ),
    jsonb_build_object(
      'type',           '3BR/2BA',
      'count',          23,
      'avg_sf',         1246,
      'market_rent',    2254,
      'rent_per_sf',    1.81
    )
  ),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name                              = EXCLUDED.name,
  status                            = EXCLUDED.status,
  deal_status                       = EXCLUDED.deal_status,
  property_address                  = EXCLUDED.property_address,
  city                              = EXCLUDED.city,
  state                             = EXCLUDED.state,
  total_units                       = EXCLUDED.total_units,
  total_raise                       = EXCLUDED.total_raise,
  min_investment                    = EXCLUDED.min_investment,
  purchase_price                    = EXCLUDED.purchase_price,
  projected_hold_years              = EXCLUDED.projected_hold_years,
  target_irr_base                   = EXCLUDED.target_irr_base,
  target_irr_conservative           = EXCLUDED.target_irr_conservative,
  target_equity_multiple            = EXCLUDED.target_equity_multiple,
  target_coc                        = EXCLUDED.target_coc,
  tax_abatement_years               = EXCLUDED.tax_abatement_years,
  tax_abatement_end_year            = EXCLUDED.tax_abatement_end_year,
  debt_io_period_months             = EXCLUDED.debt_io_period_months,
  institutional_fast_track_enabled  = EXCLUDED.institutional_fast_track_enabled,
  deal_terms                        = EXCLUDED.deal_terms,
  waterfall_terms                   = EXCLUDED.waterfall_terms,
  deal_fees                         = EXCLUDED.deal_fees,
  cost_seg_data                     = EXCLUDED.cost_seg_data,
  benchmark_rates                   = EXCLUDED.benchmark_rates,
  unit_mix                          = EXCLUDED.unit_mix,
  updated_at                        = NOW();

-- =====================================================
-- Cash Flow Projections (7-year hold)
-- =====================================================
INSERT INTO deal_cashflows (deal_slug, year, egr, operating_expenses, noi, tax_abatement, cash_on_cash, created_at)
VALUES
  ('fairmont-apartments', 1, 5100000, 2200000, 3000000, 895000,  0.0753, NOW()),
  ('fairmont-apartments', 2, 5400000, 2200000, 3200000, 922000,  0.0847, NOW()),
  ('fairmont-apartments', 3, 5600000, 2300000, 3300000, 950000,  0.0800, NOW()),
  ('fairmont-apartments', 4, 5800000, 2300000, 3500000, 978000,  0.0920, NOW()),
  ('fairmont-apartments', 5, 6000000, 2400000, 3600000, 1000000, 0.0790, NOW()),
  ('fairmont-apartments', 6, 6200000, 2500000, 3800000, 1000000, 0.0825, NOW()),
  ('fairmont-apartments', 7, 6500000, 2500000, 4000000, 1100000, 0.0916, NOW())
ON CONFLICT (deal_slug, year) DO UPDATE SET
  egr                = EXCLUDED.egr,
  operating_expenses = EXCLUDED.operating_expenses,
  noi                = EXCLUDED.noi,
  tax_abatement      = EXCLUDED.tax_abatement,
  cash_on_cash       = EXCLUDED.cash_on_cash;

-- =====================================================
-- Sensitivity Scenarios
-- =====================================================
INSERT INTO deal_sensitivity (deal_slug, scenario_name, rent_growth_pct, exit_cap_rate, occupancy_pct, expense_growth_pct, irr_low, irr_high, equity_multiple, created_at)
VALUES
  ('fairmont-apartments', 'Conservative', 0.03, 0.0600, 0.92, 0.035, 0.10, 0.11, 1.8, NOW()),
  ('fairmont-apartments', 'Base Case',    0.04, 0.0550, 0.935, 0.030, 0.14, 0.16, 2.2, NOW()),
  ('fairmont-apartments', 'Upside',       0.05, 0.0525, 0.95, 0.025, 0.17, 0.18, 2.5, NOW()),
  ('fairmont-apartments', 'Strategic',    0.06, 0.0500, 0.96, 0.025, 0.20, 0.22, 2.8, NOW())
ON CONFLICT (deal_slug, scenario_name) DO UPDATE SET
  rent_growth_pct    = EXCLUDED.rent_growth_pct,
  exit_cap_rate      = EXCLUDED.exit_cap_rate,
  occupancy_pct      = EXCLUDED.occupancy_pct,
  expense_growth_pct = EXCLUDED.expense_growth_pct,
  irr_low            = EXCLUDED.irr_low,
  irr_high           = EXCLUDED.irr_high,
  equity_multiple    = EXCLUDED.equity_multiple;
