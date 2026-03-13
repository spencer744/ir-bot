/**
 * PDF export template definitions for deal one-pagers and summaries.
 * Each template specifies which sections to include in the generated PDF.
 */

export interface PdfTemplateSection {
  id: string;
  label: string;
  description?: string;
}

export interface PdfTemplate {
  id: string;
  label: string;
  description: string;
  sections: PdfTemplateSection[];
}

export const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: 'lp_one_pager',
    label: 'LP One-Pager',
    description: 'Single-page summary: deal name, key metrics, distribution/returns snapshot, and short summary.',
    sections: [
      { id: 'key_metrics', label: 'Key metrics', description: 'Units, raise, target IRR, hold, min investment' },
      { id: 'distribution_summary', label: 'Distribution / returns snapshot', description: 'High-level returns view' },
      { id: 'summary_bullets', label: 'Summary bullets', description: '2–3 bullet points' },
    ],
  },
  {
    id: 'executive_summary',
    label: 'Executive Summary',
    description: 'Deal name, market and financial headlines, multiple chart/summary slots, bullet summary.',
    sections: [
      { id: 'key_metrics', label: 'Key metrics' },
      { id: 'market_headline', label: 'Market headline', description: 'Market narrative snippet' },
      { id: 'financial_headline', label: 'Financial headline', description: 'Target returns and structure' },
      { id: 'chart_slot_1', label: 'Chart / data slot 1', description: 'e.g. supply-demand or rent growth' },
      { id: 'chart_slot_2', label: 'Chart / data slot 2', description: 'e.g. scenario returns' },
      { id: 'summary_bullets', label: 'Summary bullets' },
    ],
  },
];

export function getTemplateById(id: string): PdfTemplate | undefined {
  return PDF_TEMPLATES.find((t) => t.id === id);
}
