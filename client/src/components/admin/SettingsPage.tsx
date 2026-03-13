import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface ConfigResponse {
  meetingsUrl: string;
  investmentPortalUrl: string;
  institutionalFormUrl: string;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className="inline-flex items-center gap-1.5 text-sm text-gc-accent hover:text-gc-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : '';

  useEffect(() => {
    let cancelled = false;
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gc-text">Settings</h1>

      {/* Deal room base URL */}
      <section className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-2">Deal room base URL</h2>
        <p className="text-sm text-gc-text-secondary mb-3">
          Share this URL with investors. Deals are accessed at /deals/[deal-slug].
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="px-3 py-2 bg-gc-bg border border-gc-border rounded-lg text-sm text-gc-text font-mono">
            {baseUrl || '—'}
          </code>
          <CopyButton value={baseUrl} label="Base URL" />
        </div>
      </section>

      {/* CTA URLs */}
      <section className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-2">CTA URLs</h2>
        <p className="text-sm text-gc-text-secondary mb-4">
          Configured in server environment. Change in hosting (e.g. Railway) or .env.
        </p>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-gc-surface-elevated rounded w-full" />
            <div className="h-10 bg-gc-surface-elevated rounded w-full" />
            <div className="h-10 bg-gc-surface-elevated rounded w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gc-text-muted uppercase tracking-wider mb-1">
                Meetings (HubSpot)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <code className="px-3 py-2 bg-gc-bg border border-gc-border rounded-lg text-sm text-gc-text font-mono break-all max-w-full">
                  {config?.meetingsUrl || '—'}
                </code>
                <CopyButton value={config?.meetingsUrl || ''} label="Meetings URL" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gc-text-muted uppercase tracking-wider mb-1">
                Investment portal
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <code className="px-3 py-2 bg-gc-bg border border-gc-border rounded-lg text-sm text-gc-text font-mono break-all max-w-full">
                  {config?.investmentPortalUrl || '—'}
                </code>
                <CopyButton value={config?.investmentPortalUrl || ''} label="Portal URL" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gc-text-muted uppercase tracking-wider mb-1">
                Institutional form ($2M+)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <code className="px-3 py-2 bg-gc-bg border border-gc-border rounded-lg text-sm text-gc-text font-mono break-all max-w-full">
                  {config?.institutionalFormUrl || '(not set)'}
                </code>
                {config?.institutionalFormUrl && (
                  <CopyButton value={config.institutionalFormUrl} label="Institutional URL" />
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* HubSpot */}
      <section className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-2">HubSpot</h2>
        <p className="text-sm text-gc-text-secondary">
          Contacts and events sync automatically from the deal room (gate registration, intake
          answers, chat extractions). No manual sync needed. Sync is handled by the server (
          <code className="text-gc-text-muted">hubspot.js</code>, <code className="text-gc-text-muted">workflows.js</code>).
        </p>
      </section>
    </div>
  );
}
