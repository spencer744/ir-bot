export interface Investor {
  id: string;
  hubspot_contact_id: string | null;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  investment_goal: InvestmentGoal | string | null;
  syndication_experience: SyndicationExperience | string | null;
  target_range: TargetRange | string | null;
  lead_source: LeadSource | string | null;
}

export type InvestmentGoal = 'cash_flow' | 'appreciation' | 'tax_benefits' | 'diversification';
export type SyndicationExperience = 'first_time' | '1_to_3' | '4_plus';
export type TargetRange = '100k_250k' | '250k_500k' | '500k_1m' | '1m_plus';
export type LeadSource = 'podcast' | 'referral' | 'social_media' | 'web_search' | 'other';

export interface Session {
  id: string;
  investor_id: string;
  deal_id: string;
  started_at: string;
  sections_visited: string[];
  chat_message_count: number;
  financial_explorer_used: boolean;
  video_watched_pct: number;
  engagement_score: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface GateFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  accredited_confirmed: boolean;
}

export type TargetHoldPeriod = '3_years' | '5_years' | '7_years' | '10_plus';
export type KeyConcern = 'liquidity' | 'market_risk' | 'tax_impact' | 'capital_preservation';

export interface IntakeAnswers {
  investment_goal?: InvestmentGoal | string;
  syndication_experience?: SyndicationExperience | string;
  target_range?: TargetRange | string;
  lead_source?: LeadSource | string;
  target_hold_period?: TargetHoldPeriod | string;
  key_concerns?: KeyConcern | string;
}
