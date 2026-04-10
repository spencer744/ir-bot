import { useState, useEffect } from 'react';
import { useDeal } from '../context/DealContext';

interface LossToLeaseItem {
  unit_type: string;
  in_place: number;
  market: number;
  gap_pct: number;
}

interface LeaseUpPaceItem {
  month: string;
  units: number;
}

interface OccupancyTrackingItem {
  quarter: string;
  fairmont: number | null;
  franklin_co: number;
  columbus_msa: number;
}

interface MidwestPopItem {
  city: string;
  growth_pct: number;
}

interface RentByBedroomItem {
  name: string;
  rent: number;
  is_subject?: boolean;
}

interface CoCProgressionItem {
  year: string;
  coc: number;
  io: boolean;
}

interface RentComparablesItem {
  name: string;
  distance: string;
  units: number;
  year_built: number;
  avg_rent: number;
  avg_sf: number;
  rent_per_sf: number;
  occupancy: number;
  renovated: boolean;
  is_subject?: boolean;
}

export interface ChartData {
  loss_to_lease: LossToLeaseItem[];
  lease_up_pace: LeaseUpPaceItem[];
  occupancy_tracking: OccupancyTrackingItem[];
  midwest_population_comparison: MidwestPopItem[];
  rent_by_bedroom: {
    one_br: RentByBedroomItem[];
    two_br: RentByBedroomItem[];
    three_br: RentByBedroomItem[];
  };
  coc_progression: CoCProgressionItem[];
  rent_comparables: RentComparablesItem[];
}

export interface MarketChartData {
  supply_demand?: Array<{ year: string; deliveries: number; absorption: number }>;
  rent_growth_history?: Array<{ year: number; submarket: number; msa: number; national: number }>;
}

export function useChartData() {
  const { deal } = useDeal();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [marketData, setMarketData] = useState<MarketChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deal) return;

    const token = localStorage.getItem('gc_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    setLoading(true);

    // Fetch charts data
    const chartsPromise = fetch(`/dealroom/api/deal/${deal.slug}/charts`, { headers })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    // Try to extract from market data if available
    const marketPromise = ((deal as any).market_data
      ? Promise.resolve({ market_data: (deal as any).market_data })
      : fetch(`/dealroom/api/deal/${deal.slug}/market`, { headers })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
    );

    Promise.all([chartsPromise, marketPromise]).then(([charts, market]) => {
      if (charts) setChartData(charts);
      if (market?.market_data) {
        setMarketData({
          supply_demand: market.market_data.supply_demand,
          rent_growth_history: market.market_data.rent_growth_history,
        });
      }
    }).catch(err => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [deal]);

  return { chartData, marketData, loading, error };
}
