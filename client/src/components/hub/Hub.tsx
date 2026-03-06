import { motion } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import SpokeCard from './SpokeCard';
import {
  Building2,
  BarChart3,
  Calculator,
  Wrench,
  Users,
  FileText,
  Play,
} from 'lucide-react';

const SPOKES = [
  {
    id: 'property',
    title: 'Property Deep Dive',
    description: 'Photos, unit mix, amenities, renovation scope',
    icon: Building2,
  },
  {
    id: 'market',
    title: 'Market Analysis',
    description: 'Employment, demographics, rent comps, supply pipeline',
    icon: BarChart3,
  },
  {
    id: 'financials',
    title: 'Financial Explorer',
    description: 'Interactive scenarios, projections, benchmarks',
    icon: Calculator,
  },
  {
    id: 'business',
    title: 'Business Plan',
    description: 'Value-add strategy, timeline, milestones',
    icon: Wrench,
  },
  {
    id: 'team',
    title: 'Team & Track Record',
    description: 'Leadership, property management, realized performance',
    icon: Users,
  },
  {
    id: 'documents',
    title: 'Documents',
    description: 'Deal deck, executive summary, PPM request',
    icon: FileText,
  },
];

export default function Hub() {
  const { deal, setCurrentSection, trackEvent } = useDeal();

  if (!deal) return null;

  const formatCurrency = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
  };

  const formatPct = (n: number) => `${(n * 100).toFixed(1)}%`;

  const handleSpokeClick = (id: string) => {
    setCurrentSection(id);
    trackEvent('spoke_click', { spoke: id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero Section — full viewport */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {deal.hero_image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${deal.hero_image_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-gc-bg/50 via-gc-bg/75 to-gc-bg" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gc-surface via-gc-bg to-gc-bg" />
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
            className="text-gc-accent text-sm font-medium tracking-wider uppercase mb-4"
          >
            Investment Opportunity
          </motion.p>

          {/* Deal Name */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gc-text tracking-tight mb-4"
          >
            {deal.name}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
            className="text-gc-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-3"
          >
            {deal.city}, {deal.state} &middot; {deal.total_units} Units &middot; Class B Value-Add Multifamily
          </motion.p>

          {/* Investment Thesis */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
            className="text-gc-text-muted text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Below-market rents with a proven renovation playbook targeting 15%+ rent premiums in Indianapolis&apos; strongest employment submarket.
          </motion.p>

          {/* Key Metrics Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10"
          >
            {[
              { label: 'Total Raise', value: formatCurrency(deal.total_raise), accent: false },
              { label: 'Target IRR', value: formatPct(deal.target_irr_base), accent: true },
              { label: 'Equity Multiple', value: `${deal.target_equity_multiple}x`, accent: false },
              { label: 'Hold Period', value: `${deal.projected_hold_years} yrs`, accent: false },
              { label: 'Minimum', value: formatCurrency(deal.min_investment), accent: false },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs text-gc-text-muted uppercase tracking-wider mb-1">{m.label}</p>
                <p className={`text-2xl font-bold font-mono-numbers ${m.accent ? 'text-gc-positive' : 'text-gc-text'}`}>
                  {m.value}
                </p>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: 'easeOut' }}
            className="flex gap-4 justify-center"
          >
            {deal.video_url && (
              <button
                onClick={() => trackEvent('video_play')}
                className="flex items-center gap-2 bg-gc-surface-elevated hover:bg-gc-border border border-gc-border text-gc-text font-medium py-3 px-6 rounded-lg text-sm transition-colors"
              >
                <Play className="w-4 h-4" />
                Watch Deal Video
              </button>
            )}
            <button
              onClick={() => document.getElementById('spokes')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gc-accent hover:bg-gc-accent-hover text-white font-medium py-3 px-6 rounded-lg text-sm transition-colors"
            >
              Explore Deal ↓
            </button>
          </motion.div>
        </div>
      </section>

      {/* Video Embed (placeholder when no URL) */}
      {deal.video_url ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 mb-16 relative z-10">
          <h3 className="text-lg font-semibold text-gc-text mb-4">Deal Walkthrough</h3>
          <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden aspect-video">
            <iframe
              src={deal.video_url}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}

      {/* Spoke Navigation Cards */}
      <section id="spokes" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gc-text mb-2">Explore the Deal</h2>
          <p className="text-gc-text-secondary">Dive deep into every aspect of this investment.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPOKES.map((spoke, i) => (
            <SpokeCard
              key={spoke.id}
              {...spoke}
              index={i}
              onClick={() => handleSpokeClick(spoke.id)}
            />
          ))}
        </div>
      </section>

      {/* Fundraise Progress (conditional) */}
      {deal.fundraise_pct != null && deal.fundraise_pct > 0 && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 text-center">
            <p className="text-sm text-gc-text-secondary mb-3">Fundraise Progress</p>
            <div className="h-2.5 bg-gc-bg rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${deal.fundraise_pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-gc-accent to-gc-accent-hover rounded-full"
              />
            </div>
            <p className="text-sm font-semibold text-gc-text font-mono-numbers">
              {deal.fundraise_pct.toFixed(0)}% Committed
            </p>
          </div>
        </section>
      )}
    </motion.div>
  );
}
