import { useState } from 'react';
import { motion } from 'framer-motion';

interface TimelineEntry {
  month: number;
  end_month?: number;
  label: string;
  type: 'milestone' | 'phase' | 'checkpoint';
  detail: string;
  category?: string;
}

interface RenovationTimelineProps {
  totalMonths: number;
  milestones: TimelineEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  interior: '#3B82F6',
  exterior: '#06B6D4',
  operations: '#34D399',
};

export default function RenovationTimeline({ totalMonths, milestones }: RenovationTimelineProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const phases = milestones.filter(m => m.type === 'phase');
  const points = milestones.filter(m => m.type === 'milestone' || m.type === 'checkpoint');

  const pct = (month: number) => (month / totalMonths) * 100;
  const monthMarkers = [0, 6, 12, 18, 24, 30].filter(m => m <= totalMonths);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-xl font-semibold text-gc-text mb-2">Renovation Timeline</h2>
      <p className="text-gc-text-muted text-sm mb-8">30-month execution roadmap from acquisition to stabilization.</p>

      {/* Desktop: Horizontal */}
      <div className="hidden md:block bg-gc-surface border border-gc-border rounded-2xl p-6 pb-8">
        {/* Phase bars */}
        <div className="relative mb-10" style={{ height: `${phases.length * 36 + 8}px` }}>
          {phases.map((phase, i) => {
            const left = pct(phase.month);
            const width = pct((phase.end_month || phase.month) - phase.month);
            const color = CATEGORY_COLORS[phase.category || 'interior'] || '#3B82F6';
            return (
              <motion.div
                key={phase.label}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                style={{
                  position: 'absolute',
                  top: i * 36,
                  left: `${left}%`,
                  width: `${width}%`,
                  transformOrigin: 'left',
                }}
                className="origin-left"
              >
                <div
                  className="h-7 rounded-full flex items-center px-3 text-xs font-medium text-white truncate"
                  style={{ backgroundColor: color }}
                >
                  {phase.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Track */}
        <div className="relative h-2 bg-gc-surface-elevated rounded-full mb-2">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: 'linear-gradient(to right, #3B82F6, #34D399)' }}
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          {/* Points on track */}
          {points.map((pt, i) => (
            <div
              key={pt.label}
              className="absolute -top-1.5 group"
              style={{ left: `${pct(pt.month)}%`, transform: 'translateX(-50%)' }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className={`rounded-full border-2 border-gc-bg ${
                  pt.type === 'milestone' ? 'w-5 h-5 bg-gc-accent' : 'w-3.5 h-3.5 bg-gc-positive'
                }`}
              />
              {/* Label above/below alternating */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center ${
                  i % 2 === 0 ? 'bottom-full mb-2' : 'top-full mt-2'
                }`}
              >
                <p className="text-[10px] font-semibold text-gc-text">{pt.label}</p>
                {hoveredIdx === i && (
                  <p className="text-[9px] text-gc-text-secondary max-w-[140px] whitespace-normal">{pt.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Month markers */}
        <div className="relative h-5">
          {monthMarkers.map(m => (
            <span
              key={m}
              className="absolute text-[10px] text-gc-text-muted -translate-x-1/2"
              style={{ left: `${pct(m)}%` }}
            >
              Mo {m}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-0">
        {milestones
          .filter(m => m.type === 'milestone' || m.type === 'checkpoint')
          .sort((a, b) => a.month - b.month)
          .map((entry, i, arr) => {
            const isMilestone = entry.type === 'milestone';
            return (
              <motion.div
                key={entry.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex gap-3"
              >
                {/* Left: month + connector */}
                <div className="flex flex-col items-center w-12 shrink-0">
                  <div
                    className={`rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isMilestone
                        ? 'w-8 h-8 bg-gc-accent text-white'
                        : 'w-6 h-6 bg-gc-positive/20 text-gc-positive'
                    }`}
                  >
                    {entry.month}
                  </div>
                  {i < arr.length - 1 && <div className="flex-1 w-px bg-gc-border mt-1" />}
                </div>
                {/* Right: content */}
                <div className="pb-6">
                  <p className="text-sm font-semibold text-gc-text">{entry.label}</p>
                  <p className="text-xs text-gc-text-secondary mt-0.5">{entry.detail}</p>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.section>
  );
}
