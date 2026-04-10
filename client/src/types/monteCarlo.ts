export interface MonteCarloParams {
  iterations: number;
  seed?: number;
}

export interface MonteCarloPercentiles {
  p5: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
}

export interface HistogramBin {
  binMin: number;
  binMax: number;
  count: number;
  mid: number;
}

export interface CDFPoint {
  irr: number;
  cumProb: number;
}

export interface ScatterPoint {
  irr: number;
  em: number;
  rentGrowth: number;
  exitCap: number;
}

export interface MonteCarloResult {
  irrPercentiles: MonteCarloPercentiles;
  emPercentiles: MonteCarloPercentiles;
  totalDistPercentiles: MonteCarloPercentiles;
  irrHistogramBins: HistogramBin[];
  emHistogramBins: HistogramBin[];
  probIrrAboveBase: number;
  iterations: number;

  // Extended fields for advanced viz
  scatterPoints: ScatterPoint[];      // ~500 sampled points for scatter plot
  cdfData: CDFPoint[];                // sorted IRR with cumulative probability
  equityPaths: number[][];            // ~100 normalized paths [0..holdYears], relative to 1.0
  baseCaseIrr: number;
  baseCaseEm: number;
  holdYears: number;

  // Sparkline data (mini distribution arrays)
  irrSparkline: number[];             // 20-bin mini histogram for sparklines
  emSparkline: number[];
}
