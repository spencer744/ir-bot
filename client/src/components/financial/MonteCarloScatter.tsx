import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { fairmontTheme } from '../charts/chartConfig';
import type { MonteCarloResult, ScatterPoint } from '../../types/monteCarlo';

const T = fairmontTheme;

interface Props {
  result: MonteCarloResult | null;
}

/** Map rent_growth (normalized 0–1) to a color from cold blue to warm gold */
function rentGrowthColor(normalized: number): string {
  // cold: #3B82F6 → warm: #D4A843
  const r = Math.round(59 + (212 - 59) * normalized);
  const g = Math.round(130 + (168 - 130) * normalized);
  const b = Math.round(246 + (67 - 246) * normalized);
  return `rgb(${r},${g},${b})`;
}

const CustomTooltip = ({
  active, payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ScatterPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg p-3 text-xs font-mono border"
      style={{ background: T.tooltipBg, borderColor: T.border, color: T.textPrimary }}
    >
      <p style={{ color: T.gold }}>IRR: <span className="font-bold">{(d.irr * 100).toFixed(1)}%</span></p>
      <p style={{ color: T.teal }}>Equity Multiple: <span className="font-bold">{d.em.toFixed(2)}x</span></p>
      <p style={{ color: T.textMuted }} className="mt-1 text-[10px]">
        Rent Growth: {(d.rentGrowth * 100).toFixed(1)}%
      </p>
      <p style={{ color: T.textMuted }} className="text-[10px]">
        Exit Cap: {(d.exitCap * 100).toFixed(1)}%
      </p>
    </div>
  );
};

export default function MonteCarloScatter({ result }: Props) {
  if (!result) {
    return (
      <div
        className="rounded-2xl p-6 h-[280px] flex items-center justify-center border"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <p className="text-xs" style={{ color: T.textMuted }}>No simulation data.</p>
      </div>
    );
  }

  const points = result.scatterPoints ?? [];
  const rgValues = points.map((p) => p.rentGrowth);
  const rgMin = Math.min(...rgValues);
  const rgMax = Math.max(...rgValues);
  const rgRange = rgMax - rgMin || 1;

  const irrMedian = result.irrPercentiles.p50;
  const emMedian = result.emPercentiles.p50;

  const basePoint = [{
    irr: result.baseCaseIrr,
    em: result.baseCaseEm,
    rentGrowth: 0,
    exitCap: 0,
  }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl p-4 sm:p-6 border relative overflow-hidden"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.07) 1px, rgba(0,0,0,0.07) 2px)',
        }}
      />

      <div className="relative z-10">
        <div className="mb-4">
          <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
            Dual-Outcome Scatter
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
            IRR vs. Equity Multiple — colored by rent growth assumption
          </p>
        </div>

        <div className="h-[280px] sm:h-[340px] relative">
          {/* Quadrant labels */}
          <div className="absolute inset-0 pointer-events-none z-10" style={{ padding: '20px 20px 20px 56px' }}>
            <div className="w-full h-full relative">
              <span
                className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider"
                style={{ color: `${T.green}88` }}
              >
                High IRR · High EM
              </span>
              <span
                className="absolute top-2 left-2 text-[9px] font-mono uppercase tracking-wider"
                style={{ color: `${T.textMuted}88` }}
              >
                Low IRR · High EM
              </span>
              <span
                className="absolute bottom-2 right-2 text-[9px] font-mono uppercase tracking-wider"
                style={{ color: `${T.amber}88` }}
              >
                High IRR · Low EM
              </span>
              <span
                className="absolute bottom-2 left-2 text-[9px] font-mono uppercase tracking-wider"
                style={{ color: `${T.red}88` }}
              >
                Low IRR · Low EM
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,53,0.6)" />
              <XAxis
                dataKey="irr"
                type="number"
                name="IRR"
                scale="linear"
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: T.axisStroke }}
                tickLine={false}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{
                  value: 'IRR',
                  position: 'insideBottom',
                  fill: T.textMuted,
                  fontSize: 10,
                  dy: 12,
                }}
              />
              <YAxis
                dataKey="em"
                type="number"
                name="Equity Multiple"
                tick={{ fill: T.axisTickColor, fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(v) => `${v.toFixed(1)}x`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: T.border }} />

              {/* Median cross-hairs */}
              <ReferenceLine x={irrMedian} stroke={T.textMuted} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.4} />
              <ReferenceLine y={emMedian} stroke={T.textMuted} strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.4} />

              {/* Simulation cloud */}
              <Scatter
                data={points}
                isAnimationActive={false}
              >
                {points.map((entry, i) => {
                  const norm = (entry.rentGrowth - rgMin) / rgRange;
                  return (
                    <Cell
                      key={i}
                      fill={rentGrowthColor(norm)}
                      fillOpacity={0.55}
                      stroke="none"
                      r={3}
                    />
                  );
                })}
              </Scatter>

              {/* Base case prominent dot */}
              <Scatter
                data={basePoint}
                isAnimationActive={false}
              >
                <Cell
                  fill={T.gold}
                  stroke={T.bg}
                  strokeWidth={2}
                  r={8}
                />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Color scale legend */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px]" style={{ color: T.textMuted }}>Rent growth:</span>
          <div
            className="flex-1 h-2 rounded-full"
            style={{
              background: 'linear-gradient(to right, #3B82F6, #D4A843)',
              maxWidth: '120px',
            }}
          />
          <span className="text-[10px] font-mono" style={{ color: '#3B82F6' }}>Low</span>
          <span className="text-[10px] font-mono" style={{ color: T.gold }}>High</span>
          <span className="ml-2 flex items-center gap-1 text-[10px]" style={{ color: T.gold }}>
            <span
              className="inline-block w-3 h-3 rounded-full border-2"
              style={{ background: T.gold, borderColor: T.bg }}
            />
            Base case
          </span>
        </div>
      </div>
    </motion.div>
  );
}
