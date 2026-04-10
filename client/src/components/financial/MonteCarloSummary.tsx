import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { fairmontTheme } from '../charts/chartConfig';
import type { Deal } from '../../types/deal';
import type { MonteCarloResult } from '../../types/monteCarlo';

const T = fairmontTheme;

interface Props {
  result: MonteCarloResult | null;
  investmentAmount: number;
  deal: Deal | null;
}

// ---- Count-up hook ----
function useCountUp(target: number, duration = 1200, trigger = true): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);
  return value;
}

// ---- Radial Gauge ----
function RadialGauge({ prob, size = 120 }: { prob: number; size?: number }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayProb = useCountUp(prob, 1400, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const r = (size / 2) * 0.72;
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;
  const startAngle = -200 * (Math.PI / 180);
  const endAngle = 20 * (Math.PI / 180);
  const totalAngle = endAngle - startAngle;
  const progressAngle = startAngle + totalAngle * prob;

  const arcPath = (from: number, to: number, radius: number) => {
    const x1 = cx + radius * Math.cos(from);
    const y1 = cy + radius * Math.sin(from);
    const x2 = cx + radius * Math.cos(to);
    const y2 = cy + radius * Math.sin(to);
    const largeArc = to - from > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const strokeW = size * 0.085;

  return (
    <div ref={ref} className="flex flex-col items-center">
      <svg width={size} height={size * 0.82} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="gaugeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path
          d={arcPath(startAngle, endAngle, r)}
          fill="none"
          stroke={T.border}
          strokeWidth={strokeW}
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d={arcPath(startAngle, progressAngle, r)}
          fill="none"
          stroke={T.gold}
          strokeWidth={strokeW}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          style={{
            transition: 'all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        />
        {/* Needle dot */}
        <circle
          cx={cx + r * Math.cos(progressAngle)}
          cy={cy + r * Math.sin(progressAngle)}
          r={strokeW * 0.55}
          fill={T.gold}
          filter="url(#gaugeGlow)"
        />
      </svg>
      <p
        className="text-3xl font-mono font-bold -mt-6"
        style={{ color: T.gold, textShadow: `0 0 20px ${T.gold}66` }}
      >
        {(displayProb * 100).toFixed(0)}%
      </p>
    </div>
  );
}

// ---- Sparkline bar ----
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-6">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${Math.max(2, (v / max) * 100)}%`,
            background: color,
            opacity: 0.5 + (v / max) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// ---- Animated metric ----
function AnimatedMetric({
  label, value, sparkData, color, unit,
}: {
  label: string;
  value: number;
  sparkData: number[];
  color: string;
  unit: 'pct' | 'x' | 'dollar';
}) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayed = useCountUp(value, 1000, inView);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const fmt = () => {
    if (unit === 'pct') return `${(displayed * 100).toFixed(1)}%`;
    if (unit === 'x') return `${displayed.toFixed(2)}x`;
    if (unit === 'dollar') {
      if (displayed >= 1_000_000) return `$${(displayed / 1_000_000).toFixed(1)}M`;
      return `$${(displayed / 1000).toFixed(0)}K`;
    }
    return displayed.toFixed(2);
  };

  return (
    <div
      ref={ref}
      className="rounded-xl p-3 sm:p-4 border relative overflow-hidden"
      style={{
        background: T.bg,
        borderColor: T.border,
        backgroundImage: 'radial-gradient(circle, rgba(42,42,53,0.5) 1px, transparent 1px)',
        backgroundSize: '10px 10px',
      }}
    >
      <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ color: T.textMuted }}>
        {label}
      </p>
      <p className="text-lg sm:text-xl font-mono font-bold mb-2" style={{ color }}>
        {fmt()}
      </p>
      <Sparkline data={sparkData} color={color} />
    </div>
  );
}

const fmtDollars = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

export default function MonteCarloSummary({ result, investmentAmount, deal }: Props) {
  if (!result || !deal) {
    return (
      <div
        className="rounded-2xl p-6 text-center border"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <p className="text-sm" style={{ color: T.textMuted }}>
          No simulation data. Sensitivity data is required to run Monte Carlo.
        </p>
      </div>
    );
  }

  const baseIrr = result.baseCaseIrr;
  const prob = result.probIrrAboveBase;

  // Sliced sparklines for sub-percentile cards
  const irrSpark = result.irrSparkline ?? [];
  const emSpark = result.emSparkline ?? [];
  // Create shifted versions for P10/P50/P90 context
  const irrP10Spark = irrSpark.slice(0, 10);
  const irrP50Spark = irrSpark.slice(5, 15);
  const irrP90Spark = irrSpark.slice(10);
  const emP10Spark = emSpark.slice(0, 10);
  const emP50Spark = emSpark.slice(5, 15);
  const emP90Spark = emSpark.slice(10);

  const distP10 = result.totalDistPercentiles.p10;
  const distP50 = result.totalDistPercentiles.p50;
  const distP90 = result.totalDistPercentiles.p90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border relative overflow-hidden"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(42,42,53,0.6) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      />
      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)',
        }}
      />

      <div className="relative z-10 p-4 sm:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: T.textPrimary }}>
              Probability Dashboard
            </h3>
            <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>
              {result.iterations.toLocaleString()} Monte Carlo simulations
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider" style={{ color: T.textMuted }}>
              Prob. IRR ≥ {(baseIrr * 100).toFixed(0)}% target
            </p>
          </div>
        </div>

        {/* Hero gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="flex-shrink-0 flex flex-col items-center">
            <RadialGauge prob={prob} size={140} />
            <p className="text-[10px] mt-1 text-center" style={{ color: T.textMuted }}>
              of simulations meet<br />target return
            </p>
          </div>

          {/* Distribution info */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'P10 IRR', val: (result.irrPercentiles.p10 * 100).toFixed(1) + '%', color: T.red },
                { label: 'Median IRR', val: (result.irrPercentiles.p50 * 100).toFixed(1) + '%', color: T.textPrimary },
                { label: 'P90 IRR', val: (result.irrPercentiles.p90 * 100).toFixed(1) + '%', color: T.green },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-2.5 border text-center"
                  style={{ background: T.surfaceElevated, borderColor: T.border }}
                >
                  <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>
                    {item.label}
                  </p>
                  <p className="text-base font-mono font-bold" style={{ color: item.color }}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
            {/* Mini distribution bar */}
            <div
              className="rounded-lg p-3 border"
              style={{ background: T.surfaceElevated, borderColor: T.border }}
            >
              <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
                IRR distribution
              </p>
              <Sparkline data={irrSpark} color={T.gold} />
              <div className="flex justify-between mt-1 text-[9px] font-mono" style={{ color: T.textMuted }}>
                <span>{(result.irrPercentiles.p5 * 100).toFixed(1)}%</span>
                <span>median {(result.irrPercentiles.p50 * 100).toFixed(1)}%</span>
                <span>{(result.irrPercentiles.p95 * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* IRR percentile cards */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
            IRR Percentiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <AnimatedMetric label="P10 IRR" value={result.irrPercentiles.p10} sparkData={irrP10Spark} color={T.red} unit="pct" />
            <AnimatedMetric label="P50 IRR (Median)" value={result.irrPercentiles.p50} sparkData={irrP50Spark} color={T.textPrimary} unit="pct" />
            <AnimatedMetric label="P90 IRR" value={result.irrPercentiles.p90} sparkData={irrP90Spark} color={T.green} unit="pct" />
          </div>
        </div>

        {/* EM percentile cards */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: T.textMuted }}>
            Equity Multiple Percentiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <AnimatedMetric label="P10 EM" value={result.emPercentiles.p10} sparkData={emP10Spark} color={T.red} unit="x" />
            <AnimatedMetric label="P50 EM" value={result.emPercentiles.p50} sparkData={emP50Spark} color={T.textPrimary} unit="x" />
            <AnimatedMetric label="P90 EM" value={result.emPercentiles.p90} sparkData={emP90Spark} color={T.green} unit="x" />
          </div>
        </div>

        {/* Total distributions for this investment */}
        <div
          className="rounded-xl p-3 sm:p-4 border"
          style={{ background: T.bg, borderColor: T.border }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: T.textMuted }}>
            Projected Distributions · {fmtDollars(investmentAmount)} invested
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Conservative (P10)', val: distP10, color: T.red },
              { label: 'Base Case (P50)', val: distP50, color: T.gold },
              { label: 'Upside (P90)', val: distP90, color: T.green },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.textMuted }}>
                  {item.label}
                </p>
                <p className="text-base sm:text-lg font-mono font-bold" style={{ color: item.color }}>
                  {fmtDollars(item.val)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
