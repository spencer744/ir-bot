import { useState, useEffect } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TabProps {
  deal: any;
  dealId: string;
  onSave: (updatedDeal: any) => void;
}

interface SectionConfig {
  key: string;
  label: string;
  description: string;
  rows: number;
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'market_analysis_md',
    label: 'Market Analysis',
    description: 'Markdown content displayed in the Market Analysis spoke. Supports full Markdown syntax.',
    rows: 14,
  },
  {
    key: 'business_plan_md',
    label: 'Business Plan',
    description: 'Markdown content displayed in the Business Plan spoke. Supports full Markdown syntax.',
    rows: 14,
  },
  {
    key: 'team_override_md',
    label: 'Team Override',
    description: 'If populated, displayed alongside standard team info. Leave blank to use defaults.',
    rows: 12,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DealContentTab({ deal, dealId, onSave }: TabProps) {
  const api = useAdminApi();

  /* Per-field state: value, saving flag, message */
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<
    Record<string, { type: 'success' | 'error'; text: string } | null>
  >({});

  /* Initialise from deal prop */
  useEffect(() => {
    if (deal) {
      const initial: Record<string, string> = {};
      for (const section of SECTIONS) {
        initial[section.key] = deal[section.key] ?? '';
      }
      setValues(initial);
    }
  }, [deal]);

  /* ---- save handler (per section) ---- */

  async function handleSave(key: string) {
    setSaving((prev) => ({ ...prev, [key]: true }));
    setMessages((prev) => ({ ...prev, [key]: null }));

    try {
      const result = await api.put(`/api/admin/deals/${dealId}`, {
        [key]: values[key],
      });

      if (result?.deal) {
        onSave(result.deal);
        setMessages((prev) => ({
          ...prev,
          [key]: { type: 'success', text: 'Saved successfully.' },
        }));
      } else {
        setMessages((prev) => ({
          ...prev,
          [key]: { type: 'success', text: 'Saved (demo mode).' },
        }));
      }
    } catch {
      setMessages((prev) => ({
        ...prev,
        [key]: { type: 'error', text: 'Failed to save. Database may not be configured.' },
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => {
        const value = values[section.key] ?? '';
        const isSaving = saving[section.key] ?? false;
        const msg = messages[section.key] ?? null;

        return (
          <div
            key={section.key}
            className="bg-gc-surface border border-gc-border rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-gc-text mb-1">{section.label}</h2>
            <p className="text-sm text-gc-text-secondary mb-4">{section.description}</p>

            <textarea
              value={value}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [section.key]: e.target.value }))
              }
              rows={section.rows}
              className="w-full bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text font-mono focus:outline-none focus:border-gc-accent-light resize-y"
              placeholder={`Enter ${section.label.toLowerCase()} content (Markdown supported)...`}
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gc-text-secondary">
                {value.length.toLocaleString()} characters
              </span>
            </div>

            {/* Save button + message */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => handleSave(section.key)}
                disabled={isSaving}
                className="bg-gc-accent hover:bg-gc-accent-hover text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : `Save ${section.label}`}
              </button>
              {msg && (
                <span
                  className={`text-sm ${msg.type === 'success' ? 'text-gc-positive' : 'text-gc-negative'}`}
                >
                  {msg.text}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
