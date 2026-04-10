import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import { chartTheme } from './chartTheme';

interface RentCompScatterItem {
  name: string;
  year_built: number;
  rent_per_sf: number;
  highlight?: 'current' | 'proforma';
  is_subject?: boolean;
  units?: number;
}

interface RentPsfVintageScatterProps {
  data: RentCompScatterItem[];
}

const FAIRMONT_GOLD = '#D4A843';
const COMP_BLUE = '#5B8FD4';

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RentCompScatterItem & { x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const isSubject = p.is_subject || p.highlight === 'current' || p.highlight === 'proforma';
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        backgroundColor: chartTheme.tooltipBg,
        borderColor: isSubject ? FAIRMONT_GOLD : chartTheme.tooltipBorder,
        color: chartTheme.tooltipTextColor,
      }}
    >
      <p className="mb-1 font-semibold" style={{ color: isSubject ? FAIRMONT_GOLD : chartTheme.tooltipTextColor }}>
        {p.name}
      </p>
      <p className="font-mono-numbers text-gc-text-muted">Vintage: {p.year_built}</p>
      <p className="font-mono-numbers font-semibold">${p.rent_per_sf.toFixed(2)}/SF</p>
      {p.units && <p className="font-mono-numbers text-gc-text-muted">{p.units} units</p>}
    </div>
  );
}

interface ShapeProps {
  cx?: number;
  cy?: number;
  payload?: RentCompScatterItem & { x: number; y: number; z: number };
}

function CompDot({ cx = 0, cy = 0, payload }: ShapeProps) {
  const name = payload?.name ?? '';
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={COMP_BLUE} fillOpacity={0.8} stroke={COMP_BLUE} strokeWidth={1} />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fontSize={9}
        fill="#8B8FA3"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {name}
      </text>
    </g>
  );
}

function FairmontDot({ cx = 0, cy = 0 }: ShapeProps) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={FAIRMONT_GOLD} fillOpacity={1} stroke="#F0D080" strokeWidth={1.5} />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fontSize={10}
        fontWeight="600"
        fill={FAIRMONT_GOLD}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        Fairmont
      </text>
    </g>
  );
}

export default function RentPsfVintageScatter({ data }: RentPsfVintageScatterProps) {
  const [inView, setInView] = useState(false);

  const scatterPoints = useMemo(() => {
    return data.map((d) => ({
      ...d,
      x: d.year_built,
      y: d.rent_per_sf,
      z: d.units ?? 200,
    }));
  }, [data]);

  // Separate Fairmont (subject) from comps
  const comps = scatterPoints.filter((d) => !d.is_subject && !d.highlight);
  const fairmontPoints = scatterPoints.filter((d) => d.is_subject || d.highlight === 'current');
  const proforma = scatterPoints.filter((d) => d.highlight === 'proforma');

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-sm font-semibold text-gc-text">Rent per SF vs Vintage</h3>
        <div className="flex items-center gap-3 text-xs text-gc-text-muted ml-auto">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: FAIRMONT_GOLD }} />
            Fairmont
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMP_BLUE, opacity: 0.8 }} />
            Comparables
          </span>
        </div>
      </div>
      <div className="h-[280px] md:h-[420px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 20, top: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
            <XAxis
              type="number"
              dataKey="x"
              name="Vintage"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.axisStroke }}
              tickLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(v) => String(v)}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="$/SF"
              tick={{ fill: chartTheme.axisTickColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v.toFixed(2)}`}
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
            />
            <ZAxis type="number" dataKey="z" range={[60, 300]} name="Units" />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: chartTheme.axisStroke }} />
            {comps.length > 0 && (
              <Scatter
                name="Comparables"
                data={comps}
                fill={COMP_BLUE}
                fillOpacity={0.8}
                isAnimationActive={inView}
                animationDuration={800}
                shape={(props: ShapeProps) => <CompDot {...props} />}
              />
            )}
            {fairmontPoints.length > 0 && (
              <Scatter
                name="Fairmont Apartments"
                data={fairmontPoints}
                fill={FAIRMONT_GOLD}
                fillOpacity={1}
                isAnimationActive={inView}
                animationDuration={800}
                shape={(props: ShapeProps) => <FairmontDot {...props} />}
              />
            )}
            {proforma.length > 0 && (
              <Scatter
                name="Subject (pro forma)"
                data={proforma}
                fill={chartTheme.positive}
                fillOpacity={1}
                isAnimationActive={inView}
                animationDuration={800}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
        ) : (
          <div className="w-full h-full" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
