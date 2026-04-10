const API_BASE = '/dealroom/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gc_session_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    deal_slug: string;
  }) => request<{ token: string; investor_id: string; session_id: string; hubspot_contact_id: string | null }>(
    '/auth/register', { method: 'POST', body: JSON.stringify(data) }
  ),

  verifySession: () => request<{
    valid: boolean;
    investor_id: string;
    session_id: string;
    email: string;
    deal_slug: string;
    is_returning: boolean;
    last_sections_visited: string[];
    investor: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      investment_goal: string | null;
      syndication_experience: string | null;
      target_range: string | null;
      lead_source: string | null;
      hubspot_contact_id: string | null;
    } | null;
  }>(
    '/auth/verify', { method: 'POST' }
  ),

  // Deals
  getDeal: (slug: string) => request<{ deal: any }>(`/deal/${slug}`),
  getDealSensitivity: (slug: string) => request<any>(`/deal/${slug}/sensitivity`),
  getDealCharts: (slug: string) => request<any>(`/deal/${slug}/charts`),
  getDealMedia: (slug: string) => request<{ media: any[] }>(`/deal/${slug}/media`),
  getDealMarket: (slug: string) => request<{ market_data: any }>(`/deal/${slug}/market`),
  getDealBusinessPlan: (slug: string) => request<{ business_plan_data: any }>(`/deal/${slug}/business-plan`),

  ppmRequest: (slug: string, data: { name: string; email: string; accredited: boolean }) =>
    request<{ success: boolean }>(`/deal/${slug}/ppm-request`, { method: 'POST', body: JSON.stringify(data) }),

  indicateInterest: (slug: string, data: { name: string; email: string; amount_range: string; notes?: string }) =>
    request<{ success: boolean }>(`/deal/${slug}/indicate-interest`, { method: 'POST', body: JSON.stringify(data) }),

  // Chat
  sendMessage: (data: {
    message: string;
    deal_slug: string;
    current_section: string;
    session_id: string;
  }) => request<{ response: string; hubspot_extract?: any; navigate?: string }>(
    '/chat', { method: 'POST', body: JSON.stringify(data) }
  ),

  submitIntake: (data: {
    answers: Record<string, string>;
    session_id: string;
  }) => request<{ success: boolean }>(
    '/chat/intake', { method: 'POST', body: JSON.stringify(data) }
  ),

  // Analytics
  trackEvent: (data: {
    event: string;
    section?: string;
    metadata?: Record<string, any>;
    session_id: string;
  }) => request<{ success: boolean }>(
    '/analytics/event', { method: 'POST', body: JSON.stringify(data) }
  ),

  heartbeat: (session_id: string) => request<{ success: boolean }>(
    '/analytics/heartbeat', { method: 'POST', body: JSON.stringify({ session_id }) }
  ),

  // Team & Track Record (firm-level)
  getTeamMembers: () => request<{ team_members: any[] }>('/team'),
  getTrackRecord: () => request<{ full_cycle: any[]; active_projects: any[] }>('/track-record'),
  getTrackRecordSummary: () => request<any>('/track-record/summary'),
  getCaseStudies: () => request<{ case_studies: any[] }>('/case-studies'),
  getTestimonials: () => request<{ testimonials: any[] }>('/testimonials'),
  getCompanyData: () => request<{ company_data: any }>('/company'),

  // Benchmarks
  getBenchmarks: () => request<any>('/benchmarks'),

  // Public config (CTA URLs)
  getConfig: () => request<{ meetingsUrl: string; investmentPortalUrl: string; institutionalFormUrl: string; hubspotPortalId?: string }>('/config'),
};
