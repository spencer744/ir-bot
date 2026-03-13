export interface MonteCarloParams {
  iterations: number;
  seed?: number;
}

export interface MonteCarloPercentiles {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface HistogramBin {
  binMin: number;
  binMax: number;
  count: number;
  mid: number;
}

export interface MonteCarloResult {
  irrPercentiles: MonteCarloPercentiles;
  emPercentiles: MonteCarloPercentiles;
  totalDistPercentiles: MonteCarloPercentiles;
  irrHistogramBins: HistogramBin[];
  emHistogramBins: HistogramBin[];
  probIrrAboveBase: number;
  iterations: number;
}
