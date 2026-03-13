import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, CircleOff, TrendingUp, type LucideIcon } from 'lucide-react';

/* -------------------------------------------------- */
/*  Types                                              */
/* -------------------------------------------------- */

interface TrackRecordSummary {
  avg_net_irr: number;
  avg_equity_multiple: number;
  avg_coc: number;
  avg_hold_years: number;
  total_realized: number;
}

interface Callout {
  icon: string;
  headline: string;
  detail: string;
}

interface TrackRecordHeroProps {
  summary: TrackRecordSummary;
  callouts: Callout[];
}

/* -------------------------------------------------- */
/*  Icon map                                           */
/* -------------------------------------------------- */

const iconMap: Record<string, LucideIcon> = {
  Shield,
  CircleOff,
  Ban: CircleOff,
  TrendingUp,
};

/* -------------------------------------------------- */
/*  Count-up hook (inline)                             */
/* -------------------------------------------------- */

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

type MetricFormat = 'percent' | 'multiplier' | 'year' | 'integer';

function useCountUp(
  target: number,
  format: MetricFormat,
  duration = 1500,
): { ref: React.RefObject<HTMLSpanElement | null>; display: string } {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(formatValue(0, format));
  const hasAnimated = useRef(false);

  const formatFn = useCallback(
    (v: number) => formatValue(v, format),
    [format],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();

          function tick(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = eased * target;
            setDisplay(formatFn(current));
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDisplay(formatFn(target));
            }
          }

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, formatFn]);

  return { ref, display };
}

function formatValue(value: number, format: MetricFormat): string {
  switch (format) {
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'multiplier':
      return `${value.toFixed(2)}x`;
    case 'year':
      return `${value.toFixed(1)}`;
    case 'integer':
      return `${Math.round(value)}`;
  }
}

/* -------------------------------------------------- */
/*  Framer variants                                    */
/* -------------------------------------------------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/* -------------------------------------------------- */
/*  Metric card sub-component                          */
/* -------------------------------------------------- */

function MetricCard({
  value,
  label,
  format,
}: {
  value: number;
  label: string;
  format: MetricFormat;
}) {
  const { ref, display } = useCountUp(value, format);

  return (
    <motion.div
      variants={item}
      className="bg-gc-surface border border-gc-border rounded-xl p-4 sm:p-6 text-center"
    >
      <span
        ref={ref}
        className="block text-3xl sm:text-4xl md:text-5xl font-bold font-mono-numbers text-gc-text"
      >
        {display}
      </span>
      <p className="text-sm text-[#8B8FA3] uppercase tracking-wider mt-2">
        {label}
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------- */
/*  Main component                                     */
/* -------------------------------------------------- */

export default function TrackRecordHero({
  summary,
  callouts,
}: TrackRecordHeroProps) {
  return (
    <section>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gc-text mb-2">
          Track Record
        </h2>
        <p className="text-gc-text-secondary text-sm md:text-base">
          {summary.total_realized} full-cycle deals. Zero capital losses.{' '}
          {summary.avg_net_irr}% average net IRR.
        </p>
      </motion.div>

      {/* Headline metrics grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <MetricCard
          value={summary.avg_net_irr}
          label="Avg. Net IRR"
          format="percent"
        />
        <MetricCard
          value={summary.avg_equity_multiple}
          label="Avg. Equity Multiple"
          format="multiplier"
        />
        <MetricCard
          value={summary.avg_coc}
          label="Avg. Cash-on-Cash"
          format="percent"
        />
        <MetricCard
          value={summary.avg_hold_years}
          label="Avg. Hold Period"
          format="year"
        />
      </motion.div>

      {/* Highlight callout cards */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {callouts.map((callout) => {
          const Icon = iconMap[callout.icon] ?? Shield;
          return (
            <motion.div
              key={callout.headline}
              variants={item}
              className="bg-gc-surface rounded-lg p-5 flex items-start gap-4"
            >
              <div className="shrink-0 mt-0.5">
                <Icon className="w-6 h-6 text-gc-accent" />
              </div>
              <div>
                <p className="font-bold text-gc-text mb-1">
                  {callout.headline}
                </p>
                <p className="text-sm text-gc-text-secondary leading-relaxed">
                  {callout.detail}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
