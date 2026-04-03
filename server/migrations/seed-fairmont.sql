-- =====================================================
-- Fairmont at Westerville Commons — Deal Seed Data
-- Gray Capital LLC Private Placement
-- =====================================================
-- Financial assumptions:
--   Purchase price:  $63,500,000  ($289,954/unit)
--   LTV ~65%:        Debt = $41,275,000
--   Closing costs:   ~$1,200,000
--   Reserves:        ~$800,000
--   Equity raise:    ~$22,500,000 (purchase + costs + reserves - debt)
--   Hold period:     6 years (5–7 range)
--   IRR target:      13.2% base
--   Equity multiple: ~1.85x (13.2% IRR over 6yr, annual compounding approx.)
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
  'fairmont',
  'Fairmont at Westerville Commons',
  'live',
  'active',
  '100 Fairmont Commons Blvd',
  'Westerville',
  'OH',
  219,
  22500000.00,   -- equity raise
  100000.00,     -- min investment
  63500000.00,   -- purchase price
  6,             -- hold years
  0.132,         -- 13.2% IRR base
  0.085,         -- 8.5% IRR conservative
  1.85,          -- 1.85x equity multiple
  0.055,         -- 5.5% cash-on-cash (stabilized)
  15,            -- 15-year tax abatement
  2041,          -- abatement ends 2041 (closing Aug 2026 = year 1 of 15)
  48,            -- 48-month IO period
  TRUE,          -- institutional fast track enabled
  -- deal_terms JSONB
  jsonb_build_object(
    'lender',              'Fannie Mae',
    'loan_type',           'Agency',
    'loan_amount',         41275000,
    'interest_rate',       0.0497,
    'loan_term_years',     10,
    'io_period_months',    48,
    'ltv',                 0.65,
    'dscr_at_stabilization', 1.38,
    'projected_close',     '2026-08-01',
    'closing_costs',       1200000,
    'operating_reserves',  800000,
    'purchase_price_per_unit', 289954
  ),
  -- waterfall_terms JSONB
  jsonb_build_object(
    'pref_rate',           0.08,
    'pref_type',           'cumulative',
    'gp_catchup',          false,
    'split_above_hurdle_1', jsonb_build_object(
      'hurdle',  0.08,
      'lp',      0.70,
      'gp',      0.30
    ),
    'split_above_hurdle_2', jsonb_build_object(
      'hurdle',  0.15,
      'lp',      0.65,
      'gp',      0.35
    )
  ),
  -- deal_fees JSONB
  jsonb_build_object(
    'acquisition_fee_pct',        0.02,
    'asset_mgmt_fee_pct',         0.02,
    'disposition_fee_pct',        0.01,
    'construction_mgmt_fee_pct',  0.05,
    'renovation_budget_per_unit', 12000,
    'renovation_budget_total',    2628000
  ),
  -- cost_seg_data JSONB
  jsonb_build_object(
    'year_1_accelerated_depreciation_pct',     0.30,
    'estimated_year_1_paper_loss_per_100k',    30000,
    'study_completed',                          false,
    'note',                                     'Cost segregation study to be completed post-closing'
  ),
  -- benchmark_rates JSONB (as of Q1 2026)
  jsonb_build_object(
    'savings_rate',        0.045,
    'treasury_10yr',       0.042,
    'muni_rate',           0.038,
    'sp500_avg_annual',    0.10
  ),
  -- unit_mix JSONB
  jsonb_build_array(
    jsonb_build_object('type', 'Studio',  'count', 24,  'avg_sf', 520,  'current_rent', 975,  'market_rent', 1125),
    jsonb_build_object('type', '1BR/1BA', 'count', 89,  'avg_sf', 720,  'current_rent', 1150, 'market_rent', 1325),
    jsonb_build_object('type', '2BR/2BA', 'count', 84,  'avg_sf', 1050, 'current_rent', 1425, 'market_rent', 1650),
    jsonb_build_object('type', '3BR/2BA', 'count', 22,  'avg_sf', 1320, 'current_rent', 1750, 'market_rent', 2025)
  ),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  name                            = EXCLUDED.name,
  status                          = EXCLUDED.status,
  deal_status                     = EXCLUDED.deal_status,
  property_address                = EXCLUDED.property_address,
  city                            = EXCLUDED.city,
  state                           = EXCLUDED.state,
  total_units                     = EXCLUDED.total_units,
  total_raise                     = EXCLUDED.total_raise,
  min_investment                  = EXCLUDED.min_investment,
  purchase_price                  = EXCLUDED.purchase_price,
  projected_hold_years            = EXCLUDED.projected_hold_years,
  target_irr_base                 = EXCLUDED.target_irr_base,
  target_irr_conservative         = EXCLUDED.target_irr_conservative,
  target_equity_multiple          = EXCLUDED.target_equity_multiple,
  target_coc                      = EXCLUDED.target_coc,
  tax_abatement_years             = EXCLUDED.tax_abatement_years,
  tax_abatement_end_year          = EXCLUDED.tax_abatement_end_year,
  debt_io_period_months           = EXCLUDED.debt_io_period_months,
  institutional_fast_track_enabled= EXCLUDED.institutional_fast_track_enabled,
  deal_terms                      = EXCLUDED.deal_terms,
  waterfall_terms                 = EXCLUDED.waterfall_terms,
  deal_fees                       = EXCLUDED.deal_fees,
  cost_seg_data                   = EXCLUDED.cost_seg_data,
  benchmark_rates                 = EXCLUDED.benchmark_rates,
  unit_mix                        = EXCLUDED.unit_mix,
  updated_at                      = NOW();
