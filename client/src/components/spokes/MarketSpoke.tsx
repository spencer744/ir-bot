import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDeal } from '../../context/DealContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { api } from '../../lib/api';
import SpokeLayout from './SpokeLayout';
import MarketHero from './market/MarketHero';
import MetroOverview from './market/MetroOverview';
import TopEmployersChart from './market/TopEmployersChart';
import SectorDonutChart from './market/SectorDonutChart';
import PopulationChart from './market/PopulationChart';
import SupplyDemandChart from './market/SupplyDemandChart';
import VacancyChart from './market/VacancyChart';
import RentGrowthChart from './market/RentGrowthChart';
import RentComparablesTable from './market/RentComparablesTable';
import MidwestThesis from './market/MidwestThesis';
import MarketRisks from './market/MarketRisks';

export default function MarketSpoke() {
  const { deal } = useDeal();
  const { trackSectionView } = useAnalytics();
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { trackSectionView('market'); }, []);

  useEffect(() => {
    if (!deal) return;
    // Try deal.market_data first (already loaded), else fetch from API
    if ((deal as any).market_data) {
      setMarketData((deal as any).market_data);
      setLoading(false);
    } else {
      api.getDealMarket(deal.slug)
        .then(res => setMarketData(res.market_data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [deal]);

  if (!deal) return null;

  const md = marketData;

  return (
    <SpokeLayout
      title="Market Analysis"
      subtitle={md ? `${deal.city}, ${deal.state} — ${md.msa_name} Metropolitan Area` : `${deal.city}, ${deal.state} Metro Area`}
    >
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-gc-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && !md && (
        <div className="bg-gc-surface border border-gc-border rounded-2xl p-8 text-center">
          <p className="text-gc-text-secondary">Market analysis data will be available once uploaded by the deal team.</p>
        </div>
      )}

      {!loading && md && (
        <div className="space-y-14">

          {/* 1. Market Hero Stat Row */}
          <MarketHero data={md} />

          {/* 2. Metro Overview */}
          {md.metro_overview_md && md.metro_snapshot && (
            <MetroOverview narrative={md.metro_overview_md} snapshot={md.metro_snapshot} />
          )}

          {/* 3. Employment Drivers */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gc-text mb-5">Employment Drivers</h2>
            {md.employment_narrative_md && (
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8 mb-6">
                <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
                  {md.employment_narrative_md.split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-gc-surface border border-gc-border rounded-2xl p-5">
                {md.top_employers && <TopEmployersChart data={md.top_employers} />}
              </div>
              <div className="lg:col-span-2 bg-gc-surface border border-gc-border rounded-2xl p-5">
                {md.sector_breakdown && <SectorDonutChart data={md.sector_breakdown} />}
              </div>
            </div>
          </motion.section>

          {/* 4. Population & Migration */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gc-text mb-5">Population & Migration</h2>
            {md.population_narrative_md && (
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8 mb-6">
                <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
                  {md.population_narrative_md.split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
            {md.population_trend && (
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-5">
                <PopulationChart data={md.population_trend} />
              </div>
            )}
          </motion.section>

          {/* 5. Multifamily Supply & Demand */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gc-text mb-5">Supply & Demand</h2>
            {md.supply_demand_narrative_md && (
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 sm:p-8 mb-6">
                <div className="text-gc-text-secondary text-sm leading-relaxed space-y-4">
                  {md.supply_demand_narrative_md.split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 bg-gc-surface border border-gc-border rounded-2xl p-5">
                {md.supply_demand && <SupplyDemandChart data={md.supply_demand} />}
              </div>
              <div className="lg:col-span-2 bg-gc-surface border border-gc-border rounded-2xl p-5">
                {md.vacancy_trend && <VacancyChart data={md.vacancy_trend} />}
              </div>
            </div>
          </motion.section>

          {/* 6. Rent Growth & Comparables */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gc-text mb-5">Rent Growth & Comparables</h2>
            {md.rent_growth_history && (
              <div className="bg-gc-surface border border-gc-border rounded-2xl p-5 mb-6">
                <RentGrowthChart data={md.rent_growth_history} />
              </div>
            )}
            {md.rent_comparables && (
              <>
                <RentComparablesTable data={md.rent_comparables} />
                {/* Insight callout */}
                <div className="mt-6 bg-gc-surface border-l-4 border-l-gc-accent border border-gc-border rounded-xl p-5">
                  <p className="text-sm text-gc-text leading-relaxed">
                    <span className="font-semibold text-gc-accent">The Opportunity:</span>{' '}
                    Parkview Commons currently rents at $1.19/SF — a 12% discount to renovated comps averaging $1.35/SF.
                    Post-renovation, the property's pro forma rents align with comparable renovated communities,
                    validating the value-add thesis with real market data.
                  </p>
                </div>
              </>
            )}
          </motion.section>

          {/* 7. Midwest Thesis */}
          {md.midwest_thesis && (
            <MidwestThesis cards={md.midwest_thesis} />
          )}

          {/* 8. Market Risks */}
          {md.market_risks && (
            <MarketRisks risks={md.market_risks} />
          )}

          {/* 9. Data Sources */}
          {md.data_sources && (
            <div className="border-t border-gc-border pt-6">
              <p className="text-xs text-gc-text-muted italic leading-relaxed">
                {md.data_sources}
              </p>
            </div>
          )}
        </div>
      )}
    </SpokeLayout>
  );
}
