import { fairmontTheme } from './chartConfig';

interface FairmontTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey?: string }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export default function FairmontTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: FairmontTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(label ?? '') : label;

  return (
    <div
      style={{
        background: fairmontTheme.tooltipBg,
        border: `1px solid ${fairmontTheme.tooltipBorder}`,
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        fontFamily: 'var(--font-mono, monospace)',
        minWidth: 140,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      }}
    >
      {displayLabel && (
        <p style={{ color: fairmontTheme.textSecondary, marginBottom: 6, fontSize: 11 }}>
          {displayLabel}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: fairmontTheme.textSecondary, fontSize: 11, flex: 1 }}>{entry.name}</span>
          <span style={{ color: fairmontTheme.textPrimary, fontWeight: 600 }}>
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
