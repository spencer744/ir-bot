import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PDF_TEMPLATES, getTemplateById } from '../../utils/pdfTemplates';

interface DealExportTabProps {
  deal: any;
  dealId: string;
  onSave: (deal: any) => void;
}

function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatPct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${((n as number) * 100).toFixed(1)}%`;
}

/** Printable content rendered into a hidden div for PDF capture */
function PrintableContent({
  templateId,
  deal,
  selectedSectionIds,
}: {
  templateId: string;
  deal: any;
  selectedSectionIds: string[];
}) {
  const template = getTemplateById(templateId);
  if (!template || !deal) return null;

  const include = (id: string) => selectedSectionIds.includes(id);
  const name = deal.name || 'Deal';
  const cityState = [deal.city, deal.state].filter(Boolean).join(', ') || '—';
  const units = deal.total_units ?? '—';
  const raise = formatCurrency(deal.total_raise);
  const irr = formatPct(deal.target_irr_base);
  const hold = deal.projected_hold_years != null ? `${deal.projected_hold_years} yrs` : '—';
  const minInv = formatCurrency(deal.min_investment ?? deal.minimum_investment);

  return (
    <div
      className="bg-white text-black p-8 max-w-[800px]"
      style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14 }}
    >
      <h1 className="text-2xl font-bold mb-6 border-b border-gray-300 pb-2">{name}</h1>
      <p className="text-gray-600 text-sm mb-6">{cityState}</p>

      {templateId === 'lp_one_pager' && (
        <>
          {include('key_metrics') && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Key metrics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div><span className="text-gray-500 block text-xs">Units</span><span className="font-semibold">{units}</span></div>
                <div><span className="text-gray-500 block text-xs">Total raise</span><span className="font-semibold">{raise}</span></div>
                <div><span className="text-gray-500 block text-xs">Target IRR</span><span className="font-semibold">{irr}</span></div>
                <div><span className="text-gray-500 block text-xs">Hold</span><span className="font-semibold">{hold}</span></div>
                <div><span className="text-gray-500 block text-xs">Min investment</span><span className="font-semibold">{minInv}</span></div>
              </div>
            </div>
          )}
          {include('distribution_summary') && (
            <div className="mb-6">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Distribution / returns snapshot</h2>
              <div className="border border-gray-300 rounded p-4 bg-gray-50 text-sm">
                Target IRR: {irr} · Hold: {hold}. Returns are illustrative; see PPM for full terms.
              </div>
            </div>
          )}
          {include('summary_bullets') && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Summary</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Class B value-add multifamily opportunity in {cityState}.</li>
                <li>Target returns and hold period as noted; see full materials for assumptions.</li>
                <li>Offers made only through PPM to accredited investors.</li>
              </ul>
            </div>
          )}
        </>
      )}

      {templateId === 'executive_summary' && (
        <>
          {include('key_metrics') && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Key metrics</h2>
              <div className="flex flex-wrap gap-6">
                <span>Units: <strong>{units}</strong></span>
                <span>Raise: <strong>{raise}</strong></span>
                <span>Target IRR: <strong>{irr}</strong></span>
                <span>Hold: <strong>{hold}</strong></span>
                <span>Min invest: <strong>{minInv}</strong></span>
              </div>
            </div>
          )}
          {include('market_headline') && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-1">Market</h2>
              <p className="text-sm">Strong fundamentals in {cityState}. Supply-demand balance supportive of value-add strategy.</p>
            </div>
          )}
          {include('financial_headline') && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-1">Financial</h2>
              <p className="text-sm">Target IRR {irr} over {hold}. Minimum investment {minInv}. See PPM for full terms.</p>
            </div>
          )}
          {(include('chart_slot_1') || include('chart_slot_2')) && (
            <div className="flex gap-4 mb-4">
              {include('chart_slot_1') && (
                <div className="flex-1 border border-gray-300 rounded p-4 bg-gray-50 text-center text-gray-500 text-sm min-h-[80px]">
                  [Chart / data slot 1]
                </div>
              )}
              {include('chart_slot_2') && (
                <div className="flex-1 border border-gray-300 rounded p-4 bg-gray-50 text-center text-gray-500 text-sm min-h-[80px]">
                  [Chart / data slot 2]
                </div>
              )}
            </div>
          )}
          {include('summary_bullets') && (
            <div>
              <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2">Summary</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Value-add multifamily in {cityState}.</li>
                <li>Target returns and structure as noted; see deal materials for full details.</li>
                <li>Offers made only through PPM to accredited investors.</li>
              </ul>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
        Gray Capital · Confidential · For informational purposes only. Not an offer.
      </p>
    </div>
  );
}

export function DealExportTab({ deal, dealId, onSave: _onSave }: DealExportTabProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PDF_TEMPLATES[0].id);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
    PDF_TEMPLATES[0].sections.map((s) => s.id),
  );
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const template = getTemplateById(selectedTemplateId);

  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const t = getTemplateById(id);
    setSelectedSectionIds(t ? t.sections.map((s) => s.id) : []);
  };

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleGenerate = async () => {
    if (!deal || !printRef.current || !template) return;
    setGenerating(true);
    setError(null);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgH = w * ratio;
      pdf.addImage(imgData, 'PNG', 0, 0, w, Math.min(imgH, h));
      if (imgH > h) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -(h * (imgH / h - 1)), w, imgH);
      }
      const filename = `deal-${(deal.slug || dealId || 'export').replace(/[^a-z0-9-]/gi, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  };

  if (!deal) {
    return (
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6 text-gc-text-secondary text-sm">
        Save the deal first, then use Export.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gc-surface border border-gc-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gc-text mb-2">Export PDF</h2>
        <p className="text-sm text-gc-text-secondary mb-6">
          Choose a template and sections, then generate a PDF for this deal.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gc-text mb-2">Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text w-full max-w-md"
            >
              {PDF_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {template && (
              <p className="text-xs text-gc-text-muted mt-1">{template.description}</p>
            )}
          </div>

          {template && (
            <div>
              <label className="block text-sm font-medium text-gc-text mb-2">Include sections</label>
              <div className="flex flex-col gap-2">
                {template.sections.map((sec) => (
                  <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSectionIds.includes(sec.id)}
                      onChange={() => toggleSection(sec.id)}
                      className="w-4 h-4 rounded border-gc-border bg-gc-bg text-gc-accent focus:ring-gc-accent"
                    />
                    <span className="text-sm text-gc-text">{sec.label}</span>
                    {sec.description && (
                      <span className="text-xs text-gc-text-muted">— {sec.description}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || selectedSectionIds.length === 0}
            className="bg-gc-accent hover:bg-gc-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating…' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* Hidden printable area for PDF capture */}
      <div
        ref={printRef}
        style={{ position: 'fixed', left: '-9999px', top: 0, width: 800 }}
        aria-hidden
      >
        <PrintableContent
          templateId={selectedTemplateId}
          deal={deal}
          selectedSectionIds={selectedSectionIds}
        />
      </div>
    </div>
  );
}
