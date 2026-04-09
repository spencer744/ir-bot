import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, Check, X, AlertTriangle, Loader2, Download } from 'lucide-react';

interface DealImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: (dealId: string) => void;
}

interface CsvPreview {
  dealName: string;
  location: string;
  units: string;
  purchasePrice: string;
  totalRaise: string;
  scenarioCount?: number;
  dataPoints?: number;
  warnings: string[];
}

function parseOverviewCsv(text: string): Partial<CsvPreview> {
  const fields: Record<string, string> = {};
  const warnings: string[] = [];

  // Simple state machine to handle quoted multi-line values
  const lines = text.split(/\r?\n/);
  let currentKey = '';
  let currentVal = '';
  let inQuote = false;

  for (const line of lines) {
    if (inQuote) {
      // We're inside a quoted value that spans multiple lines
      if (line.includes('"')) {
        // Closing quote found — end of multi-line value
        currentVal += '\n' + line.replace(/"$/, '');
        inQuote = false;
        fields[currentKey] = currentVal;
        currentKey = '';
        currentVal = '';
      } else {
        currentVal += '\n' + line;
      }
      continue;
    }

    const sep = line.indexOf(',');
    if (sep === -1) continue;

    const key = line.slice(0, sep).trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!key || key === 'field') continue;

    let val = line.slice(sep + 1).trim();

    // Check if value starts with a quote but doesn't end with one (multi-line)
    if (val.startsWith('"') && !val.endsWith('"')) {
      inQuote = true;
      currentKey = key;
      currentVal = val.slice(1); // Remove opening quote
      continue;
    }

    // Normal single-line value — strip surrounding quotes
    val = val.replace(/^"|"$/g, '');
    fields[key] = val;
  }

  const name = fields['deal_name'] || fields['name'] || fields['property_name'] || '';
  if (!name) warnings.push('No deal name found in CSV');

  const city = fields['city'] || '';
  const state = fields['state'] || '';
  const units = fields['total_units'] || fields['units'] || '';
  const price = fields['purchase_price'] || fields['acquisition_price'] || '';
  const raise = fields['total_raise'] || fields['equity_raise'] || '';

  if (!units) warnings.push('No unit count found');
  if (!price) warnings.push('No purchase price found');

  return {
    dealName: name,
    location: city && state ? `${city}, ${state}` : city || state || '',
    units,
    purchasePrice: price,
    totalRaise: raise,
    warnings,
  };
}

function parseSensitivityCsv(text: string): { scenarioCount: number; dataPoints: number; warnings: string[] } {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const warnings: string[] = [];

  if (lines.length < 2) {
    warnings.push('Sensitivity CSV appears empty');
    return { scenarioCount: 0, dataPoints: 0, warnings };
  }

  const sections = new Set<string>();
  let dataPoints = 0;
  const scenarios = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      sections.add(sectionMatch[1]);
      continue;
    }
    if (trimmed.startsWith('scenario,') || trimmed.startsWith('rent_growth,') ||
        trimmed.startsWith('exit_cap,') || trimmed.startsWith('occupancy,') ||
        trimmed.startsWith('type,')) {
      continue;
    }
    dataPoints++;
    const firstCol = trimmed.split(',')[0]?.trim().toLowerCase();
    if (['downside', 'base', 'upside', 'strategic'].includes(firstCol)) {
      scenarios.add(firstCol);
    }
  }

  if (sections.size === 0) warnings.push('No [section] markers found — is this a sectioned sensitivity CSV?');
  if (scenarios.size === 0 && sections.has('scenarios')) warnings.push('No scenario rows found in [scenarios] section');

  return {
    scenarioCount: scenarios.size,
    dataPoints,
    warnings,
  };
}

function formatCurrency(val: string): string {
  const num = parseFloat(val.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return val || '--';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

export default function DealImportModal({ open, onClose, onImported }: DealImportModalProps) {
  const [overviewFile, setOverviewFile] = useState<File | null>(null);
  const [sensitivityFile, setSensitivityFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  const overviewRef = useRef<HTMLInputElement>(null);
  const sensitivityRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setOverviewFile(null);
    setSensitivityFile(null);
    setPreview(null);
    setImporting(false);
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const processOverview = useCallback(async (file: File) => {
    setOverviewFile(file);
    setError('');
    const text = await file.text();
    const parsed = parseOverviewCsv(text);
    setPreview(prev => ({
      dealName: parsed.dealName ?? '',
      location: parsed.location ?? '',
      units: parsed.units ?? '',
      purchasePrice: parsed.purchasePrice ?? '',
      totalRaise: parsed.totalRaise ?? '',
      scenarioCount: prev?.scenarioCount,
      dataPoints: prev?.dataPoints,
      warnings: parsed.warnings ?? [],
    }));
  }, []);

  const processSensitivity = useCallback(async (file: File) => {
    setSensitivityFile(file);
    setError('');
    const text = await file.text();
    const parsed = parseSensitivityCsv(text);
    setPreview(prev => prev ? {
      ...prev,
      scenarioCount: parsed.scenarioCount,
      dataPoints: parsed.dataPoints,
      warnings: [...(prev.warnings ?? []), ...parsed.warnings],
    } : null);
  }, []);

  const onDrop = useCallback((type: 'overview' | 'sensitivity') => (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (type === 'overview') processOverview(file);
    else processSensitivity(file);
  }, [processOverview, processSensitivity]);

  const onFileChange = useCallback((type: 'overview' | 'sensitivity') => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'overview') processOverview(file);
    else processSensitivity(file);
  }, [processOverview, processSensitivity]);

  const preventDefault = useCallback((e: DragEvent) => e.preventDefault(), []);

  const handleImport = useCallback(async () => {
    if (!overviewFile) return;
    setImporting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('overview', overviewFile);
      if (sensitivityFile) formData.append('sensitivity', sensitivityFile);

      const token = localStorage.getItem('admin_token');
      const res = await fetch('/dealroom/api/admin/deals/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Import failed (${res.status})`);
      }

      const data = await res.json();
      reset();
      onImported(data.deal_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }, [overviewFile, sensitivityFile, reset, onImported]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gc-surface border border-gc-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gc-text">Import Deal from CSV</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gc-text-secondary hover:text-gc-text p-1 rounded-lg hover:bg-gc-surface-elevated transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Overview CSV */}
          <div
            onDragOver={preventDefault}
            onDrop={onDrop('overview')}
            onClick={() => overviewRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              overviewFile
                ? 'border-gc-positive/50 bg-gc-positive/5'
                : 'border-gc-border hover:border-gc-accent/50 hover:bg-gc-surface-elevated/50'
            }`}
          >
            <input
              ref={overviewRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={onFileChange('overview')}
            />
            {overviewFile ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-gc-positive" />
                <span className="text-sm font-medium text-gc-text truncate max-w-full">{overviewFile.name}</span>
                <span className="text-xs text-gc-positive">Ready</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gc-text-secondary" />
                <span className="text-sm font-medium text-gc-text">Deal Overview CSV</span>
                <span className="text-xs text-gc-text-secondary">Required — click or drag</span>
              </div>
            )}
          </div>

          {/* Sensitivity CSV */}
          <div
            onDragOver={preventDefault}
            onDrop={onDrop('sensitivity')}
            onClick={() => sensitivityRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
              sensitivityFile
                ? 'border-gc-positive/50 bg-gc-positive/5'
                : 'border-gc-border hover:border-gc-accent/50 hover:bg-gc-surface-elevated/50'
            }`}
          >
            <input
              ref={sensitivityRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={onFileChange('sensitivity')}
            />
            {sensitivityFile ? (
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-gc-positive" />
                <span className="text-sm font-medium text-gc-text truncate max-w-full">{sensitivityFile.name}</span>
                <span className="text-xs text-gc-positive">Ready</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-gc-text-secondary" />
                <span className="text-sm font-medium text-gc-text">Sensitivity CSV</span>
                <span className="text-xs text-gc-text-secondary">Optional — click or drag</span>
              </div>
            )}
          </div>
        </div>

        {/* Template Links */}
        <div className="flex items-center gap-1 text-xs text-gc-text-muted mb-6">
          <Download className="w-3 h-3" />
          <span>Download template:</span>
          <a
            href="/dealroom/api/admin/deals/import/template/overview"
            download="deal_overview_template.csv"
            className="text-gc-accent hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Overview
          </a>
          <span>|</span>
          <a
            href="/dealroom/api/admin/deals/import/template/sensitivity"
            download="deal_sensitivity_template.csv"
            className="text-gc-accent hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Sensitivity
          </a>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-gc-bg border border-gc-border rounded-lg p-4 mb-6 space-y-3">
            <h3 className="text-sm font-medium text-gc-text-secondary uppercase tracking-wider">Preview</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gc-text-muted text-xs">Deal Name</span>
                <p className="text-gc-text font-medium truncate">{preview.dealName || '--'}</p>
              </div>
              <div>
                <span className="text-gc-text-muted text-xs">Location</span>
                <p className="text-gc-text">{preview.location || '--'}</p>
              </div>
              <div>
                <span className="text-gc-text-muted text-xs">Units</span>
                <p className="text-gc-text font-mono">{preview.units || '--'}</p>
              </div>
              <div>
                <span className="text-gc-text-muted text-xs">Purchase Price</span>
                <p className="text-gc-text font-mono">{preview.purchasePrice ? formatCurrency(preview.purchasePrice) : '--'}</p>
              </div>
              <div>
                <span className="text-gc-text-muted text-xs">Total Raise</span>
                <p className="text-gc-text font-mono">{preview.totalRaise ? formatCurrency(preview.totalRaise) : '--'}</p>
              </div>
              {preview.scenarioCount != null && (
                <div>
                  <span className="text-gc-text-muted text-xs">Sensitivity</span>
                  <p className="text-gc-text font-mono">{preview.scenarioCount} scenarios · {preview.dataPoints} rows</p>
                </div>
              )}
            </div>

            {preview.warnings.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-gc-border/50">
                {preview.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gc-warning">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-gc-negative bg-gc-negative/10 border border-gc-negative/20 rounded-lg p-3 mb-4">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="text-gc-text-secondary hover:text-gc-text px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!overviewFile || importing}
            className="bg-gc-accent hover:bg-gc-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-colors touch-manipulation flex items-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing…
              </>
            ) : (
              'Import Deal'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
