import { useState, useEffect } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';
import { SensitivityUploader } from './SensitivityUploader';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TabProps {
  deal: any;
  dealId: string;
  onSave: (updatedDeal: any) => void;
}

interface ScenarioAssumptions {
  annual_rent_growth: number;
  exit_cap: number;
  avg_occupancy: number;
  annual_expense_growth: number;
}

interface ScenarioEntry {
  label: string;
  assumptions: ScenarioAssumptions;
}

type ScenarioKey = 'downside' | 'base' | 'upside' | 'strategic';

interface Scenarios {
  downside: ScenarioEntry;
  base: ScenarioEntry;
  upside: ScenarioEntry;
  strategic: ScenarioEntry;
}

const SCENARIO_KEYS: { key: ScenarioKey; label: string }[] = [
  { key: 'downside', label: 'Conservative' },
  { key: 'base', label: 'Base' },
  { key: 'upside', label: 'Upside' },
  { key: 'strategic', label: 'Strategic' },
];

const ASSUMPTION_ROWS: { key: keyof ScenarioAssumptions; label: string; isPercent: boolean }[] = [
  { key: 'annual_rent_growth', label: 'Annual Rent Growth', isPercent: true },
  { key: 'annual_expense_growth', label: 'Annual Expense Growth', isPercent: true },
  { key: 'avg_occupancy', label: 'Stabilized Occupancy', isPercent: true },
  { key: 'exit_cap', label: 'Exit Cap Rate', isPercent: true },
];

function buildDefaultScenarios(): Scenarios {
  return {
    downside: {
      label: 'Conservative',
      assumptions: { annual_rent_growth: 0.02, annual_expense_growth: 0.035, avg_occupancy: 0.91, exit_cap: 0.058 },
    },
    base: {
      label: 'Base',
      assumptions: { annual_rent_growth: 0.035, annual_expense_growth: 0.03, avg_occupancy: 0.94, exit_cap: 0.053 },
    },
    upside: {
      label: 'Upside',
      assumptions: { annual_rent_growth: 0.045, annual_expense_growth: 0.025, avg_occupancy: 0.96, exit_cap: 0.048 },
    },
    strategic: {
      label: 'Strategic',
      assumptions: { annual_rent_growth: 0.055, annual_expense_growth: 0.025, avg_occupancy: 0.97, exit_cap: 0.045 },
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DealSensitivityTab({ deal, dealId, onSave }: TabProps) {
  const api = useAdminApi();

  const [scenarios, setScenarios] = useState<Scenarios>(buildDefaultScenarios);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* Initialise from deal data */
  useEffect(() => {
    if (deal?.sensitivity_data?.scenarios) {
      setScenarios(deal.sensitivity_data.scenarios);
    }
  }, [deal]);

  /* ---- helpers ---- */

  function toDisplay(decimal: number): string {
    return (decimal * 100).toFixed(1);
  }

  function fromDisplay(displayVal: string): number {
    const n = parseFloat(displayVal);
    if (isNaN(n)) return 0;
    return n / 100;
  }

  function handleCellChange(
    scenarioKey: ScenarioKey,
    assumptionKey: keyof ScenarioAssumptions,
    value: string,
  ) {
    setScenarios((prev) => ({
      ...prev,
      [scenarioKey]: {
        ...prev[scenarioKey],
        assumptions: {
          ...prev[scenarioKey].assumptions,
          [assumptionKey]: fromDisplay(value),
        },
      },
    }));
  }

  async function handleSaveScenarios() {
    setSaving(true);
    setSaveMsg(null);

    try {
      // Build the updated sensitivity_data payload
      const updatedSensitivity = {
        ...(deal?.sensitivity_data || {}),
        scenarios,
      };

      const result = await api.put(`/api/admin/deals/${dealId}`, {
        sensitivity_data: updatedSensitivity,
      });

      if (result?.deal) {
        onSave(result.deal);
        setSaveMsg({ type: 'success', text: 'Scenarios saved successfully.' });
      } else {
        setSaveMsg({ type: 'success', text: 'Scenarios saved (demo mode).' });
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Failed to save scenarios. Database may not be configured.' });
    } finally {
      setSaving(false);
    }
  }

  function handleUploadComplete() {
    // Re-fetch deal to get updated sensitivity data
    if (dealId && dealId !== 'new') {
      api.get(`/api/admin/deals/${dealId}`).then((res: any) => {
        if (res?.deal) {
          onSave(res.deal);
          if (res.deal.sensitivity_data?.scenarios) {
            setScenarios(res.deal.sensitivity_data.scenarios);
          }
        }
      });
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="space-y-8">
      {/* ---- Section 1: Named Scenarios Table ---- */}
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-4">Named Scenarios</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gc-border">
                <th className="text-left py-3 pr-4 text-gc-text-secondary font-medium w-48">
                  Assumption
                </th>
                {SCENARIO_KEYS.map((s) => (
                  <th
                    key={s.key}
                    className="text-center py-3 px-2 text-gc-text-secondary font-medium min-w-[120px]"
                  >
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ASSUMPTION_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-gc-border/50">
                  <td className="py-3 pr-4 text-gc-text font-medium">{row.label}</td>
                  {SCENARIO_KEYS.map((s) => (
                    <td key={s.key} className="py-3 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={toDisplay(scenarios[s.key].assumptions[row.key])}
                          onChange={(e) => handleCellChange(s.key, row.key, e.target.value)}
                          className="w-full bg-gc-bg border border-gc-border rounded px-2 py-1 text-sm text-gc-text text-center focus:outline-none focus:border-gc-accent-light"
                        />
                        <span className="text-gc-text-secondary text-xs">%</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Save button + message */}
        <div className="mt-4 flex items-center gap-4">
          <button
            onClick={handleSaveScenarios}
            disabled={saving}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Scenarios'}
          </button>
          {saveMsg && (
            <span
              className={`text-sm ${saveMsg.type === 'success' ? 'text-gc-positive' : 'text-gc-negative'}`}
            >
              {saveMsg.text}
            </span>
          )}
        </div>
      </div>

      {/* ---- Section 2: Sensitivity Data Upload ---- */}
      <SensitivityUploader dealId={dealId} onUploadComplete={handleUploadComplete} />
    </div>
  );
}
