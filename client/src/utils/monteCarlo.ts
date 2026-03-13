import type { Deal, SensitivityData } from '../types/deal';
import type { MonteCarloResult, HistogramBin } from '../types/monteCarlo';

function linearInterpolate(x: number, x0: number, x1: number, y0: number, y1: number): number {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/**
 * Linear interpolation from rent_growth_vs_irr table.
 */
export function interpolateRentGrowthVsIrr(
  sensitivityData: SensitivityData | null,
  rentGrowth: number
): { irr: number; equity_multiple: number; avg_coc: number } | null {
  const table = sensitivityData?.sensitivity_tables?.rent_growth_vs_irr;
  if (!table?.length) return null;

  const sorted = [...table].sort((a, b) => (a.rent_growth ?? 0) - (b.rent_growth ?? 0));
  const minRg = sorted[0].rent_growth ?? 0;
  const maxRg = sorted[sorted.length - 1].rent_growth ?? 0;
  const clamped = Math.max(minRg, Math.min(maxRg, rentGrowth));

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const ra = a.rent_growth ?? 0;
    const rb = b.rent_growth ?? 0;
    if (clamped >= ra && clamped <= rb) {
      return {
        irr: linearInterpolate(clamped, ra, rb, a.irr ?? 0, b.irr ?? 0),
        equity_multiple: linearInterpolate(clamped, ra, rb, a.equity_multiple ?? 0, b.equity_multiple ?? 0),
        avg_coc: linearInterpolate(clamped, ra, rb, a.avg_coc ?? 0, b.avg_coc ?? 0),
      };
    }
  }
  const last = sorted[sorted.length - 1];
  return {
    irr: last.irr ?? 0,
    equity_multiple: last.equity_multiple ?? 0,
    avg_coc: last.avg_coc ?? 0,
  };
}

/**
 * Bilinear interpolation from rent_growth_x_exit_cap for IRR.
 * Returns null if table missing or point out of range.
 */
export function interpolateRentGrowthExitCap(
  sensitivityData: SensitivityData | null,
  rentGrowth: number,
  exitCap: number
): number | null {
  const table = sensitivityData?.sensitivity_tables?.rent_growth_x_exit_cap;
  if (!table?.length) return null;

  const rgs = [...new Set(table.map((r) => r.rent_growth ?? 0))].sort((a, b) => a - b);
  const ecs = [...new Set(table.map((r) => r.exit_cap ?? 0))].sort((a, b) => a - b);
  const minRg = rgs[0];
  const maxRg = rgs[rgs.length - 1];
  const minEc = ecs[0];
  const maxEc = ecs[ecs.length - 1];
  const rg = Math.max(minRg, Math.min(maxRg, rentGrowth));
  const ec = Math.max(minEc, Math.min(maxEc, exitCap));

  const getCell = (rgVal: number, ecVal: number): number | null => {
    const row = table.find((r) => r.rent_growth === rgVal && r.exit_cap === ecVal);
    return row?.irr ?? null;
  };

  const rg0 = rgs.filter((x) => x <= rg).pop() ?? minRg;
  const rg1 = rgs.filter((x) => x >= rg).shift() ?? maxRg;
  const ec0 = ecs.filter((x) => x <= ec).pop() ?? minEc;
  const ec1 = ecs.filter((x) => x >= ec).shift() ?? maxEc;

  const v00 = getCell(rg0, ec0);
  const v01 = getCell(rg0, ec1);
  const v10 = getCell(rg1, ec0);
  const v11 = getCell(rg1, ec1);

  if (v00 === null && v01 === null && v10 === null && v11 === null) return null;
  const _ = (a: number | null, b: number) => (a !== null ? a : b);
  const c00 = _(v00, _(v01, _(v10, _(v11, 0))));
  const c01 = _(v01, c00);
  const c10 = _(v10, c00);
  const c11 = _(v11, _(v10, _(v01, c00)));

  if (rg0 === rg1 && ec0 === ec1) return c00;
  const tRg = rg0 === rg1 ? 0 : (rg - rg0) / (rg1 - rg0);
  const tEc = ec0 === ec1 ? 0 : (ec - ec0) / (ec1 - ec0);
  const top = linearInterpolate(tEc, 0, 1, c00, c01);
  const bot = linearInterpolate(tEc, 0, 1, c10, c11);
  return linearInterpolate(tRg, 0, 1, top, bot);
}

/**
 * Linear interpolation from exit_cap_vs_irr for equity_multiple.
 */
function interpolateExitCapEm(
  sensitivityData: SensitivityData | null,
  exitCap: number
): number | null {
  const table = sensitivityData?.sensitivity_tables?.exit_cap_vs_irr;
  if (!table?.length) return null;

  const sorted = [...table].sort((a, b) => (a.exit_cap ?? 0) - (b.exit_cap ?? 0));
  const minEc = sorted[0].exit_cap ?? 0;
  const maxEc = sorted[sorted.length - 1].exit_cap ?? 0;
  const clamped = Math.max(minEc, Math.min(maxEc, exitCap));

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const ea = a.exit_cap ?? 0;
    const eb = b.exit_cap ?? 0;
    if (clamped >= ea && clamped <= eb) {
      return linearInterpolate(clamped, ea, eb, a.equity_multiple ?? 0, b.equity_multiple ?? 0);
    }
  }
  return sorted[sorted.length - 1].equity_multiple ?? null;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return linearInterpolate(index, lower, upper, sorted[lower], sorted[upper]);
}

function buildHistogram(values: number[], numBins: number, minVal: number, maxVal: number): HistogramBin[] {
  const range = maxVal - minVal || 1;
  const bins: HistogramBin[] = Array.from({ length: numBins }, (_, i) => ({
    binMin: minVal + (i / numBins) * range,
    binMax: minVal + ((i + 1) / numBins) * range,
    count: 0,
    mid: minVal + ((i + 0.5) / numBins) * range,
  }));

  for (const v of values) {
    const i = Math.min(
      numBins - 1,
      Math.max(0, Math.floor(((v - minVal) / range) * numBins))
    );
    bins[i].count += 1;
  }
  return bins;
}

/** Seeded RNG (simple LCG) for reproducible runs when seed is provided. */
function createRng(seed?: number): () => number {
  if (seed == null) return () => Math.random();
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const DEFAULT_ITERATIONS = 2000;
const MAX_ITERATIONS = 3000;
const IRR_BINS = 18;
const EM_BINS = 16;

/**
 * Run Monte Carlo simulation: sample rent_growth and exit_cap from table bounds,
 * map to IRR/EM via sensitivity tables, aggregate percentiles and histograms.
 */
export function runMonteCarlo(
  sensitivityData: SensitivityData | null,
  deal: Deal | null,
  investmentAmount: number,
  iterations: number = DEFAULT_ITERATIONS,
  seed?: number
): MonteCarloResult | null {
  if (!sensitivityData || !deal) return null;

  const tables = sensitivityData.sensitivity_tables;
  const rentGrowthTable = tables?.rent_growth_vs_irr;
  const exitCapTable = tables?.exit_cap_vs_irr;
  const gridTable = tables?.rent_growth_x_exit_cap;

  if (!rentGrowthTable?.length || !exitCapTable?.length || !gridTable?.length) return null;

  const rgMin = Math.min(...rentGrowthTable.map((r) => r.rent_growth ?? 0));
  const rgMax = Math.max(...rentGrowthTable.map((r) => r.rent_growth ?? 0));
  const ecMin = Math.min(...exitCapTable.map((r) => r.exit_cap ?? 0));
  const ecMax = Math.max(...exitCapTable.map((r) => r.exit_cap ?? 0));

  const iter = Math.min(MAX_ITERATIONS, Math.max(500, Math.floor(iterations)));
  const rng = createRng(seed);

  const irrs: number[] = [];
  const ems: number[] = [];
  const totalDists: number[] = [];

  for (let i = 0; i < iter; i++) {
    const rentGrowth = rgMin + rng() * (rgMax - rgMin);
    const exitCap = ecMin + rng() * (ecMax - ecMin);

    const irr = interpolateRentGrowthExitCap(sensitivityData, rentGrowth, exitCap);
    const em = interpolateExitCapEm(sensitivityData, exitCap);

    if (irr == null || em == null) continue;

    irrs.push(irr);
    ems.push(em);
    totalDists.push(investmentAmount * em);
  }

  if (irrs.length === 0) return null;

  const sortedIrr = [...irrs].sort((a, b) => a - b);
  const sortedEm = [...ems].sort((a, b) => a - b);
  const sortedDist = [...totalDists].sort((a, b) => a - b);

  const baseIrr = deal.target_irr_base ?? sensitivityData.scenarios?.base?.returns?.lp_irr ?? 0.158;
  const probAboveBase = irrs.filter((x) => x >= baseIrr).length / irrs.length;

  const irrMin = Math.min(...irrs);
  const irrMax = Math.max(...irrs);
  const emMin = Math.min(...ems);
  const emMax = Math.max(...ems);

  return {
    irrPercentiles: {
      p10: percentile(sortedIrr, 10),
      p25: percentile(sortedIrr, 25),
      p50: percentile(sortedIrr, 50),
      p75: percentile(sortedIrr, 75),
      p90: percentile(sortedIrr, 90),
    },
    emPercentiles: {
      p10: percentile(sortedEm, 10),
      p25: percentile(sortedEm, 25),
      p50: percentile(sortedEm, 50),
      p75: percentile(sortedEm, 75),
      p90: percentile(sortedEm, 90),
    },
    totalDistPercentiles: {
      p10: percentile(sortedDist, 10),
      p25: percentile(sortedDist, 25),
      p50: percentile(sortedDist, 50),
      p75: percentile(sortedDist, 75),
      p90: percentile(sortedDist, 90),
    },
    irrHistogramBins: buildHistogram(irrs, IRR_BINS, irrMin, irrMax),
    emHistogramBins: buildHistogram(ems, EM_BINS, emMin, emMax),
    probIrrAboveBase: probAboveBase,
    iterations: irrs.length,
  };
}
