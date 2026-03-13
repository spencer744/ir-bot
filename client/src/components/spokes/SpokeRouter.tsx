import { motion } from 'framer-motion';
import SpokeLayout from './SpokeLayout';
import PropertySpoke from './PropertySpoke';
import MarketSpoke from './MarketSpoke';
import FinancialSpoke from '../financial/FinancialSpoke';
import BusinessSpoke from './BusinessSpoke';
import TeamSpoke from './TeamSpoke';
import DocumentsSpoke from './DocumentsSpoke';

const SPOKE_MAP: Record<string, React.ComponentType> = {
  property: PropertySpoke,
  market: MarketSpoke,
  financials: FinancialSpoke,
  business: BusinessSpoke,
  team: TeamSpoke,
  documents: DocumentsSpoke,
};

export default function SpokeRouter({ section }: { section: string }) {
  const Component = SPOKE_MAP[section];

  if (!Component) {
    return (
      <SpokeLayout title="Not Found">
        <p className="text-gc-text-secondary">Section not found.</p>
      </SpokeLayout>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
    >
      <Component />
    </motion.div>
  );
}
