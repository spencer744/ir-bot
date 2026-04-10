/**
 * FairmontChartsSection — standalone chart section for any spoke.
 * Pass `section="business" | "market" | "financial"` to get the right charts.
 */
import { motion } from 'framer-motion';
import { useChartData } from '../../hooks/useChartData';
import { fairmontTheme } from './chartConfig';

import LossToLeaseChart from './LossToLeaseChart';
import LeaseUpPaceChart from './LeaseUpPaceChart';
import OccupancyTrackingChart from './OccupancyTrackingChart';
import MidwestPopulationChart from './MidwestPopulationChart';
import RentByBedroomChart from './RentByBedroomChart';
import CoCProgressionChart from './CoCProgressionChart';
import SensitivityScenarioViewer from './SensitivityScenarioViewer';
import SupplyDemandAreaChart from './SupplyDemandAreaChart';
import RentGrowthHistoryChart from './RentGrowthHistoryChart';

type Section = 'business' | 'market' | 'financial' | 'all';

interface Props {
  section?: Section;
  sensitivityScenarios?: any;
}

function ChartCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: fairmontTheme.surface,
        border: `1px solid ${fairmontTheme.border}`,
        backgroundImage: fairmontTheme.dotGrid,
        backgroundSize: '20px 20px',
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className="flex items-center gap-3 mb-5"
    >
      <span
        className="inline-block w-1 h-5 rounded-full"
        style={{ background: fairmontTheme.gold }}
      />
      <h2 className="text-base font-semibold" style={{ color: fairmontTheme.textPrimary }}>
        {title}
      </h2>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function FairmontChartsSection({ section = 'all', sensitivityScenarios }: Props) {
  const { chartData, marketData, loading } = useChartData();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div
            key={i}
            className="rounded-2xl h-64 animate-pulse"
            style={{ background: fairmontTheme.surface, border: `1px solid ${fairmontTheme.border}` }}
          />
        ))}
      </div>
    );
  }

  if (!chartData) return null;

  // Business section charts: loss-to-lease, lease-up, occupancy
  if (section === 'business') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="space-y-5 mt-10"
      >
        <SectionHeader title="Live Market Data" />

        <motion.div variants={itemVariants}>
          <ChartCard>
            <LossToLeaseChart data={chartData.loss_to_lease} />
          </ChartCard>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-5">
          <motion.div variants={itemVariants}>
            <ChartCard>
              <LeaseUpPaceChart data={chartData.lease_up_pace} />
            </ChartCard>
          </motion.div>
          <motion.div variants={itemVariants}>
            <ChartCard>
              <OccupancyTrackingChart data={chartData.occupancy_tracking} />
            </ChartCard>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Market section charts: population, supply/demand, rent growth, rent by bedroom
  if (section === 'market') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="space-y-5 mt-10"
      >
        <SectionHeader title="Market Intelligence" />

        <motion.div variants={itemVariants}>
          <ChartCard>
            <MidwestPopulationChart data={chartData.midwest_population_comparison} />
          </ChartCard>
        </motion.div>

        {marketData?.supply_demand && (
          <motion.div variants={itemVariants}>
            <ChartCard>
              <SupplyDemandAreaChart data={marketData.supply_demand} />
            </ChartCard>
          </motion.div>
        )}

        {marketData?.rent_growth_history && (
          <motion.div variants={itemVariants}>
            <ChartCard>
              <RentGrowthHistoryChart data={marketData.rent_growth_history} />
            </ChartCard>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <ChartCard>
            <RentByBedroomChart data={chartData.rent_by_bedroom} />
          </ChartCard>
        </motion.div>
      </motion.div>
    );
  }

  // Financial section charts: CoC, sensitivity
  if (section === 'financial') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="space-y-5 mt-10"
      >
        <SectionHeader title="Return Projections" />

        <motion.div variants={itemVariants}>
          <ChartCard>
            <CoCProgressionChart data={chartData.coc_progression} />
          </ChartCard>
        </motion.div>

        {sensitivityScenarios && (
          <motion.div variants={itemVariants}>
            <ChartCard>
              <SensitivityScenarioViewer scenarios={sensitivityScenarios} />
            </ChartCard>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // 'all' — render everything
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <ChartCard>
          <LossToLeaseChart data={chartData.loss_to_lease} />
        </ChartCard>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div variants={itemVariants}>
          <ChartCard>
            <LeaseUpPaceChart data={chartData.lease_up_pace} />
          </ChartCard>
        </motion.div>
        <motion.div variants={itemVariants}>
          <ChartCard>
            <OccupancyTrackingChart data={chartData.occupancy_tracking} />
          </ChartCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <ChartCard>
          <MidwestPopulationChart data={chartData.midwest_population_comparison} />
        </ChartCard>
      </motion.div>

      {marketData?.supply_demand && (
        <motion.div variants={itemVariants}>
          <ChartCard>
            <SupplyDemandAreaChart data={marketData.supply_demand} />
          </ChartCard>
        </motion.div>
      )}

      {marketData?.rent_growth_history && (
        <motion.div variants={itemVariants}>
          <ChartCard>
            <RentGrowthHistoryChart data={marketData.rent_growth_history} />
          </ChartCard>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <ChartCard>
          <RentByBedroomChart data={chartData.rent_by_bedroom} />
        </ChartCard>
      </motion.div>

      <motion.div variants={itemVariants}>
        <ChartCard>
          <CoCProgressionChart data={chartData.coc_progression} />
        </ChartCard>
      </motion.div>

      {sensitivityScenarios && (
        <motion.div variants={itemVariants}>
          <ChartCard>
            <SensitivityScenarioViewer scenarios={sensitivityScenarios} />
          </ChartCard>
        </motion.div>
      )}
    </motion.div>
  );
}
