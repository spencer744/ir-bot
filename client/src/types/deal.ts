export interface Deal {
  id: string;
  slug: string;
  name: string;
  status: 'draft' | 'live' | 'closed';
  property_address: string;
  city: string;
  state: string;
  total_units: number;
  total_raise: number;
  min_investment: number;
  purchase_price: number;
  projected_hold_years: number;
  target_irr_base: number;
  target_equity_multiple: number;
  target_coc: number;
  sensitivity_data: SensitivityData | null;
  waterfall_terms: WaterfallTerms;
  cost_seg_data: CostSegData;
  deal_terms: DealTerms;
  hero_image_url: string;
  video_url: string;
  market_analysis_md: string;
  business_plan_md: string;
  team_override_md: string | null;
  fundraise_pct: number | null;
  benchmark_rates: BenchmarkRates;
  created_at: string;
  updated_at: string;
}

export interface DealMedia {
  id: string;
  deal_id: string;
  type: 'photo' | 'video' | 'document' | 'floor_plan';
  url: string;
  caption: string;
  category: 'exterior' | 'interior' | 'amenity' | 'renovation' | 'progress' | 'aerial';
  sort_order: number;
}

export interface ScenarioAssumptions {
  annual_rent_growth: number;
  exit_cap: number;
  avg_occupancy: number;
  annual_expense_growth: number;
}

export interface Scenario {
  label: string;
  assumptions: ScenarioAssumptions;
}

export interface SensitivityRow {
  [key: string]: number;
}

export interface AnnualCashFlow {
  noi: number;
  debt_service: number;
  cash_flow_to_equity: number;
  distribution_per_unit: number;
}

export interface SensitivityData {
  deal_slug: string;
  scenarios: {
    downside: Scenario;
    base: Scenario;
    upside: Scenario;
    strategic: Scenario;
  };
  sensitivity_tables: {
    rent_growth_vs_irr: SensitivityRow[];
    exit_cap_vs_irr: SensitivityRow[];
    occupancy_vs_irr: SensitivityRow[];
    rent_growth_x_exit_cap: SensitivityRow[];
  };
  annual_cash_flows: {
    downside: Record<string, AnnualCashFlow>;
    base: Record<string, AnnualCashFlow>;
    upside: Record<string, AnnualCashFlow>;
    strategic: Record<string, AnnualCashFlow>;
  };
  waterfall: WaterfallTerms;
  deal_terms: DealTerms;
  cost_seg: CostSegData;
}

export interface WaterfallTerms {
  pref_rate: number;
  pref_type: 'cumulative' | 'non_cumulative';
  pref_basis: 'committed_capital' | 'contributed_capital';
  hurdle_1_irr: number | null;
  split_below_hurdle: { lp: number; gp: number };
  hurdle_1_rate: number;
  split_above_hurdle_1: { lp: number; gp: number };
  catch_up: boolean;
}

export interface DealTerms {
  total_raise: number;
  min_investment: number;
  projected_hold_years: number;
  purchase_price: number;
  total_units: number;
  loan_amount: number;
  interest_rate: number;
}

export interface CostSegData {
  year_1_accelerated_depreciation_pct: number;
  total_depreciable_basis: number;
  estimated_year_1_paper_loss_per_100k: number;
}

export interface BenchmarkRates {
  savings: number;
  treasury_10yr: number;
  muni_bond: number;
  sp500_avg: number;
}

export type ScenarioKey = 'downside' | 'base' | 'upside' | 'strategic';
