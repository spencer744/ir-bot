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
  units?: number;
}

interface RentPsfVintageScatterProps {
  data: RentCompScatterItem[];
}

function ScatterTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: RentCompScatterItem & { x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs shadow-lg border"
      style={{
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        color: chartTheme.tooltipTextColor,
      }}
    >
      <p className="text-gc-text-muted mb-1 font-medium">{p.name}</p>
      <p className="font-mono-numbers">Vintage: {p.year_built}</p>
      <p className="font-mono-numbers font-semibold">${p.rent_per_sf.toFixed(2)}/SF</p>
    </div>
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

  const comps = scatterPoints.filter((d) => !d.highlight);
  const current = scatterPoints.filter((d) => d.highlight === 'current');
  const proforma = scatterPoints.filter((d) => d.highlight === 'proforma');

  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-60px' }}
    >
      <h3 className="text-sm font-semibold text-gc-text mb-4">Rent per SF vs Vintage</h3>
      <div className="h-[250px] md:h-[400px] min-h-[200px]">
        {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
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
            <ZAxis type="number" dataKey="z" range={[80, 400]} name="Units" />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: chartTheme.axisStroke }} />
            {comps.length > 0 && (
              <Scatter
                name="Comparables"
                data={comps}
                fill={chartTheme.accent}
                fillOpacity={0.85}
                isAnimationActive={inView}
                animationDuration={800}
              />
            )}
            {current.length > 0 && (
              <Scatter
                name="Subject (current)"
                data={current}
                fill={chartTheme.warning}
                fillOpacity={1}
                isAnimationActive={inView}
                animationDuration={800}
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
