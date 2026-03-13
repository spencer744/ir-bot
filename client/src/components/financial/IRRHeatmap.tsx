import { useMemo } from 'react';
import type { SensitivityData } from '../../types/deal';

interface Props {
  sensitivityData: SensitivityData | null;
}

function buildGrid(
  table: { rent_growth: number; exit_cap: number; irr: number }[],
  rgs: number[],
  ecs: number[]
): (number | null)[][] {
  const get = (rg: number, ec: number): number | null => {
    const row = table.find((r) => r.rent_growth === rg && r.exit_cap === ec);
    return row?.irr ?? null;
  };
  return rgs.map((rg) => ecs.map((ec) => get(rg, ec)));
}

export default function IRRHeatmap({ sensitivityData }: Props) {
  const { grid, rgs, ecs, minIrr, maxIrr } = useMemo(() => {
    const table = sensitivityData?.sensitivity_tables?.rent_growth_x_exit_cap;
    if (!table?.length) return { grid: [] as (number | null)[][], rgs: [] as number[], ecs: [] as number[], minIrr: 0, maxIrr: 0 };

    const rgs = [...new Set(table.map((r) => r.rent_growth ?? 0))].sort((a, b) => a - b);
    const ecs = [...new Set(table.map((r) => r.exit_cap ?? 0))].sort((a, b) => a - b);
    const typed = table.map((r) => ({
      rent_growth: r.rent_growth ?? 0,
      exit_cap: r.exit_cap ?? 0,
      irr: r.irr ?? 0,
    }));
    const grid = buildGrid(typed, rgs, ecs);
    let minIrr = Infinity;
    let maxIrr = -Infinity;
    grid.forEach((row) =>
      row.forEach((v) => {
        if (v != null && v < minIrr) minIrr = v;
        if (v != null && v > maxIrr) maxIrr = v;
      })
    );
    if (minIrr === Infinity) minIrr = 0;
    if (maxIrr === -Infinity) maxIrr = 0.2;
    return { grid, rgs, ecs, minIrr, maxIrr };
  }, [sensitivityData]);

  if (!sensitivityData || grid.length === 0) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-2xl p-6 text-center">
        <p className="text-gc-text-muted text-sm">Sensitivity data is required for the IRR heatmap.</p>
      </div>
    );
  }

  const range = maxIrr - minIrr || 0.01;
  const toColor = (irr: number) => {
    const t = (irr - minIrr) / range;
    const r = Math.round(59 + (52 - 59) * t);
    const g = Math.round(130 + (211 - 130) * t);
    const b = Math.round(246 + (153 - 246) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="bg-gc-surface border border-gc-border rounded-2xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gc-text mb-3">IRR by rent growth and exit cap</h3>
      <p className="text-gc-text-muted text-xs mb-4">
        Two-way sensitivity: each cell is IRR at the given rent growth and exit cap rate.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-gc-text-muted font-medium p-1.5 text-left border border-gc-border bg-gc-bg/50 rounded-tl">
                Rent growth \ Exit cap
              </th>
              {ecs.map((ec) => (
                <th
                  key={ec}
                  className="text-gc-text font-mono-numbers font-medium p-1.5 text-center border border-gc-border bg-gc-bg/50"
                >
                  {(ec * 100).toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rgs.map((rg, i) => (
              <tr key={rg}>
                <td className="text-gc-text font-mono-numbers font-medium p-1.5 border border-gc-border bg-gc-bg/30">
                  {(rg * 100).toFixed(1)}%
                </td>
                {ecs.map((ec, j) => {
                  const irr = grid[i][j];
                  if (irr == null) {
                    return (
                      <td key={ec} className="p-1.5 text-center border border-gc-border text-gc-text-muted bg-gc-bg/20">
                        —
                      </td>
                    );
                  }
                  const color = toColor(irr);
                  return (
                    <td
                      key={ec}
                      className="p-1.5 text-center border border-gc-border font-mono-numbers font-medium"
                      style={{
                        backgroundColor: color,
                        color: (irr - minIrr) / range > 0.5 ? '#0A0A0F' : '#F0F0F5',
                      }}
                    >
                      {(irr * 100).toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-3 text-[10px] text-gc-text-muted">
        <span>Low IRR</span>
        <div className="flex gap-0.5">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <div
              key={t}
              className="w-4 h-2 rounded-sm"
              style={{ backgroundColor: toColor(minIrr + t * range) }}
            />
          ))}
        </div>
        <span>High IRR</span>
      </div>
    </div>
  );
}
