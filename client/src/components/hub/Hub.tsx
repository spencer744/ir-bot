import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useDeal } from '../../context/DealContext';
import { SPOKES } from '../../constants/spokes';
import SpokeCard from './SpokeCard';
import DealTermsCard from './DealTermsCard';
import IndicateInterestCard from './IndicateInterestCard';
import ResearchProgressBar from './ResearchProgressBar';
// RisksSection moved to Financial Explorer spoke
import { isEmbedVideoUrl, getEmbedVideoUrl } from '../../utils/videoUrl';

export default function Hub() {
  const { deal, setCurrentSection, trackEvent, sectionsVisited } = useDeal();
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);

  if (!deal) return null;

  const showHeroVideo = deal.hero_video_url?.trim() && !heroVideoFailed;
  const walkthroughEmbedUrl = deal.video_url?.trim() && isEmbedVideoUrl(deal.video_url)
    ? getEmbedVideoUrl(deal.video_url)
    : null;
  const walkthroughDirectVideo = deal.video_url?.trim() && !isEmbedVideoUrl(deal.video_url);

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
        {showHeroVideo ? (
          <>
            <video
              aria-label="Deal hero background"
              className="absolute inset-0 w-full h-full object-cover"
              src={deal.hero_video_url}
              poster={deal.hero_image_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setHeroVideoFailed(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gc-bg/50 via-gc-bg/75 to-gc-bg" />
          </>
        ) : deal.hero_image_url ? (
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
            {deal.city}, {deal.state} &middot; {deal.total_units} Units &middot; {'Class A Multifamily'}
          </motion.p>

          {/* Investment Thesis */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease: 'easeOut' }}
            className="text-gc-text-muted text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed"
          >
            A newly constructed Class A community in one of Columbus&apos; most supply-constrained suburbs, backed by a 15-year tax abatement and institutional-quality demand fundamentals.
          </motion.p>

          {/* Key Metrics Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-4 sm:gap-10 mb-10"
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

          <DealTermsCard deal={deal} />

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
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

      {/* Deal Walkthrough — embed (YouTube/Vimeo) or direct video */}
      {(deal.video_url && (walkthroughEmbedUrl || walkthroughDirectVideo)) ? (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 mb-16 relative z-10" aria-label="Deal walkthrough video">
          <h3 className="text-lg font-semibold text-gc-text mb-4">Deal Walkthrough</h3>
          <div className="bg-gc-surface border border-gc-border rounded-2xl overflow-hidden aspect-video">
            {walkthroughEmbedUrl ? (
              <iframe
                src={walkthroughEmbedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Deal walkthrough video"
              />
            ) : (
              <video
                src={deal.video_url}
                className="w-full h-full object-contain"
                controls
                title="Deal walkthrough video"
              />
            )}
          </div>
        </section>
      ) : null}

      {/* Gray Capital At-A-Glance */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gc-text mb-2">Gray Capital Track Record</h2>
          <p className="text-gc-text-secondary text-sm">10 full-cycle deals. Zero capital losses. 29.3% average net IRR.</p>
        </motion.div>

        {/* Track Record Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { value: '29.3%', label: 'AVG. NET IRR' },
            { value: '2.16x', label: 'AVG. EQUITY MULTIPLE' },
            { value: '8.0%', label: 'AVG. CASH-ON-CASH' },
            { value: '3.5', label: 'AVG. HOLD PERIOD' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gc-surface border border-gc-border rounded-2xl p-5 text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold font-mono-numbers text-gc-text mb-1">{stat.value}</p>
              <p className="text-[10px] text-gc-text-muted uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Differentiators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {[
            { title: 'Capital Preservation is #1', desc: 'Never lost a single dollar of investor capital.' },
            { title: 'No Capital Calls, Ever', desc: 'Assets capitalized to mitigate risk \u2014 obsess over buying and financing the right way.' },
            { title: 'Cash-Flow Focused', desc: 'Stable, steady cash flow at acquisition \u2014 operationally driven growth seeds upside.' },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gc-surface border border-gc-border rounded-xl p-4"
            >
              <h4 className="text-sm font-semibold text-gc-text mb-1">{item.title}</h4>
              <p className="text-xs text-gc-text-secondary leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Vertically Integrated Platform */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h3 className="text-lg font-semibold text-gc-text mb-2">Vertically Integrated Platform</h3>
          <p className="text-gc-text-secondary text-sm mb-4">
            Gray Capital controls every aspect of the investment process \u2014 acquisitions, asset management, property management, construction, and design. Everything in-house.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { name: 'Gray Capital', sub: 'CAPITAL MANAGEMENT', items: ['Acquisitions', 'Capital Raising', 'Asset Management', 'Fund Management', 'Dispositions'] },
            { name: 'Gray Residential', sub: 'PROPERTY MANAGEMENT', items: ['Leasing', 'Marketing', 'Maintenance', 'Collections'] },
            { name: 'Gray Construction', sub: 'CONSTRUCTION & DESIGN', items: ['Project Management', 'Vendor Sourcing', 'Interior Design'] },
            { name: 'The Gray Report', sub: 'MULTIFAMILY INTELLIGENCE', items: ['Industry Research', 'Market Data', 'Weekly Podcast & Newsletter'] },
          ].map((pillar) => (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gc-surface border border-gc-border rounded-xl p-4"
            >
              <h4 className="text-sm font-semibold text-gc-accent mb-0.5">{pillar.name}</h4>
              <p className="text-[10px] text-gc-text-muted uppercase tracking-wider mb-3">{pillar.sub}</p>
              <ul className="space-y-1">
                {pillar.items.map((item) => (
                  <li key={item} className="text-xs text-gc-text-secondary flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gc-accent-light rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Sponsor Co-Invest Callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gc-surface border-l-4 border-gc-positive rounded-xl p-4"
        >
          <p className="text-sm text-gc-text-secondary">
            <span className="text-gc-positive text-lg font-bold font-mono-numbers">14%</span>{' '}
            Average Sponsor Co-Invest \u2014 3x the market average. Gray Capital wins when investors win. High alignment of interest means our incentives are directly tied to yours.
          </p>
        </motion.div>
      </section>

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

        <ResearchProgressBar />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SPOKES.map((spoke, i) => (
            <SpokeCard
              key={spoke.id}
              {...spoke}
              index={i}
              onClick={() => handleSpokeClick(spoke.id)}
            />
          ))}
          <IndicateInterestCard
            index={SPOKES.length}
            visible={sectionsVisited.filter(s => s !== 'hub').length >= 3}
          />
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
