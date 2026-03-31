import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useDeal } from '../../context/DealContext';
import { SPOKES } from '../../constants/spokes';

const TOTAL_SPOKES = SPOKES.length; // 6

function getBarColor(count: number): string {
  if (count >= 5) return 'from-emerald-500 to-emerald-400';
  if (count >= 3) return 'from-amber-500 to-amber-400';
  return 'from-slate-500 to-slate-400';
}

function getNudgeText(count: number): string {
  if (count === 0) return 'Start exploring to learn about this investment.';
  if (count < 3) return `You've just begun — explore more sections to build conviction.`;
  if (count < 5) return `Great progress! A few more sections to go.`;
  if (count < TOTAL_SPOKES) return `Almost there — one more section to explore.`;
  return '';
}

export default function ResearchProgressBar() {
  const { sectionsVisited, trackEvent } = useDeal();
  const completedRef = useRef(false);

  // Count only spoke sections (not 'hub')
  const spokeIds = SPOKES.map(s => s.id);
  const visited = sectionsVisited.filter(s => spokeIds.includes(s));
  const count = visited.length;
  const pct = Math.round((count / TOTAL_SPOKES) * 100);
  const isComplete = count >= TOTAL_SPOKES;

  // Fire HubSpot event when research is complete (once per session)
  useEffect(() => {
    if (isComplete && !completedRef.current) {
      completedRef.current = true;
      trackEvent('gc_full_research_completed', { sections: count });

      // Also fire via analytics route for HubSpot sync
      const token = localStorage.getItem('gc_session_token');
      const sessionId = localStorage.getItem('gc_session_id');
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          event: 'gc_full_research_completed',
          section: 'hub',
          metadata: { gc_full_research_completed: true, sections_count: count },
          session_id: sessionId,
        }),
      }).catch(() => {});
    }
  }, [isComplete, count, trackEvent]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>
          ) : null}
          <h3 className="text-sm font-medium text-gc-text">
            {isComplete
              ? 'Research Complete ✓'
              : `Deal Research: ${count} of ${TOTAL_SPOKES} sections explored`
            }
          </h3>
        </div>
        <span className="text-xs text-gc-text-muted font-mono-numbers">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gc-surface-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor(count)}`}
        />
      </div>

      {/* Nudge text */}
      {!isComplete && (
        <p className="text-xs text-gc-text-muted mt-1.5">{getNudgeText(count)}</p>
      )}
    </div>
  );
}
