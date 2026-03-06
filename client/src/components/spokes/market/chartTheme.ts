export const chartTheme = {
  gridStroke: '#1C1C24',
  axisStroke: '#2A2A35',
  axisTickColor: '#8B8FA3',
  tooltipBg: '#1C1C24',
  tooltipBorder: '#2A2A35',
  tooltipTextColor: '#F0F0F5',
  accent: '#3B82F6',
  secondary: '#8B8FA3',
  positive: '#34D399',
  warning: '#FBBF24',
  negative: '#F87171',
};

export const SECTOR_COLORS: Record<string, string> = {
  Healthcare: '#34D399',
  Pharma: '#6EE7B7',
  Logistics: '#3B82F6',
  Technology: '#A78BFA',
  Manufacturing: '#F59E0B',
  'Logistics & Distribution': '#3B82F6',
  'Government & Education': '#8B8FA3',
  'Finance & Insurance': '#60A5FA',
  'Retail & Hospitality': '#F97316',
  Other: '#6B7280',
};

export const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};
