import { useState, useEffect } from 'react';
import { useAdminApi } from '../../hooks/useAdminApi';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DealOverviewTabProps {
  deal: any;
  dealId: string;
  onSave: (updatedDeal: any) => void;
}

interface FormData {
  // Property Details
  name: string;
  slug: string;
  property_address: string;
  city: string;
  state: string;
  total_units: number | '';
  year_built: number | '';
  purchase_price: number | '';
  hero_image_url: string;
  hero_video_url: string;
  deal_video_url: string;
  // Capital Structure
  total_raise: number | '';
  gp_coinvest: number | '';
  minimum_investment: number | '';
  loan_amount: number | '';
  interest_rate: number | '';
  io_period: number | '';
  loan_term: number | '';
  // Deal Terms
  preferred_return: number | '';
  pref_type: string;
  gp_catchup: string;
  lp_split: number | '';
  gp_split: number | '';
  hold_period: number | '';
  // Fee Structure
  acquisition_fee: number | '';
  asset_management_fee: number | '';
  construction_management_fee: number | '';
  disposition_fee: number | '';
  // Deal Status
  status: string;
  fundraise_progress: number;
  show_fundraise: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getInitialFormData(deal: any): FormData {
  return {
    name: deal?.name ?? '',
    slug: deal?.slug ?? '',
    property_address: deal?.property_address ?? '',
    city: deal?.city ?? '',
    state: deal?.state ?? '',
    total_units: deal?.total_units ?? '',
    year_built: deal?.year_built ?? '',
    purchase_price: deal?.purchase_price ?? '',
    hero_image_url: deal?.hero_image_url ?? '',
    hero_video_url: deal?.hero_video_url ?? '',
    deal_video_url: deal?.deal_video_url ?? deal?.video_url ?? '',
    total_raise: deal?.total_raise ?? '',
    gp_coinvest: deal?.gp_coinvest ?? '',
    minimum_investment: deal?.minimum_investment ?? 100000,
    loan_amount: deal?.loan_amount ?? '',
    interest_rate: deal?.interest_rate ?? '',
    io_period: deal?.io_period ?? '',
    loan_term: deal?.loan_term ?? '',
    preferred_return: deal?.preferred_return ?? 8,
    pref_type: deal?.pref_type ?? 'cumulative',
    gp_catchup: deal?.gp_catchup ?? 'no',
    lp_split: deal?.lp_split ?? '',
    gp_split: deal?.gp_split ?? '',
    hold_period: deal?.hold_period ?? '',
    acquisition_fee: deal?.acquisition_fee ?? '',
    asset_management_fee: deal?.asset_management_fee ?? '',
    construction_management_fee: deal?.construction_management_fee ?? '',
    disposition_fee: deal?.disposition_fee ?? '',
    status: deal?.status ?? 'draft',
    fundraise_progress: deal?.fundraise_progress ?? 0,
    show_fundraise: deal?.show_fundraise ?? false,
  };
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gc-surface border border-gc-border rounded-xl p-6 space-y-4">
      <h3 className="text-base font-semibold text-gc-text">{title}</h3>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gc-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const INPUT_CLASSES =
  'w-full bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text focus:outline-none focus:border-gc-accent-light';

const SELECT_CLASSES =
  'w-full bg-gc-bg border border-gc-border rounded-lg px-3 py-2 text-sm text-gc-text focus:outline-none focus:border-gc-accent-light appearance-none cursor-pointer';

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DealOverviewTab({ deal, dealId, onSave }: DealOverviewTabProps) {
  const api = useAdminApi();
  const isNew = dealId === 'new';

  const [formData, setFormData] = useState<FormData>(getInitialFormData(deal));
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish' | 'golive' | null>(null);

  /* ---- Populate form when deal prop changes ---- */
  useEffect(() => {
    setFormData(getInitialFormData(deal));
  }, [deal]);

  /* ---- Form handlers ---- */
  function updateField(field: keyof FormData, value: string | number | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear save message when user edits
    if (saveMessage) setSaveMessage(null);
  }

  function handleNameBlur() {
    if (!formData.slug && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }

  /* ---- Save ---- */
  async function handleSave() {
    if (!formData.name.trim()) {
      setSaveMessage({ type: 'error', text: 'Deal name is required.' });
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      const payload: Record<string, unknown> = { ...formData };
      // Auto-generate slug if empty
      if (!payload.slug) {
        payload.slug = generateSlug(payload.name as string);
      }
      // Map form field to API/DB column name
      payload.video_url = payload.deal_video_url;
      delete payload.deal_video_url;

      let result: any;
      if (isNew) {
        result = await api.post('/dealroom/api/admin/deals', payload);
      } else {
        result = await api.put(`/api/admin/deals/${dealId}`, payload);
      }

      const updatedDeal = result.deal ?? { ...payload, id: result.id ?? dealId };
      setSaveMessage({ type: 'success', text: isNew ? 'Deal created successfully.' : 'Changes saved.' });
      onSave(updatedDeal);
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err?.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  /* ---- Publish / Unpublish / Go live ---- */
  function handlePublishClick(action: 'publish' | 'unpublish' | 'golive') {
    setPublishAction(action);
    setShowPublishConfirm(true);
  }

  async function confirmPublish() {
    if (!publishAction) return;

    const newStatus = publishAction === 'unpublish' ? 'draft' : 'live';
    setSaving(true);
    setSaveMessage(null);
    setShowPublishConfirm(false);

    try {
      const result = await api.put(`/api/admin/deals/${dealId}`, {
        ...formData,
        status: newStatus,
      });

      const updatedDeal = result.deal ?? { ...formData, status: newStatus, id: dealId };
      setFormData((prev) => ({ ...prev, status: newStatus }));
      const successMessages: Record<string, string> = {
        publish: 'Deal published successfully.',
        unpublish: 'Deal unpublished.',
        golive: 'Deal is now live.',
      };
      setSaveMessage({
        type: 'success',
        text: successMessages[publishAction] || 'Status updated.',
      });
      onSave(updatedDeal);
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err?.message || 'Failed to update status.' });
    } finally {
      setSaving(false);
      setPublishAction(null);
    }
  }

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */

  return (
    <div className="space-y-6">
      {/* Section 1: Property Details */}
      <SectionCard title="Property Details">
        <Field label="Deal Name *">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={handleNameBlur}
            placeholder="e.g. Fairmont Apartments"
          />
        </Field>

        <Field label="Slug">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="auto-generated-from-name"
          />
        </Field>

        <Field label="Property Address">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.property_address}
            onChange={(e) => updateField('property_address', e.target.value)}
            placeholder="123 Main St"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City">
            <input
              type="text"
              className={INPUT_CLASSES}
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Indianapolis"
            />
          </Field>
          <Field label="State">
            <select
              className={SELECT_CLASSES}
              value={formData.state}
              onChange={(e) => updateField('state', e.target.value)}
            >
              <option value="">Select state...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Total Units">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.total_units}
              onChange={(e) => updateField('total_units', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="312"
            />
          </Field>
          <Field label="Year Built">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.year_built}
              onChange={(e) => updateField('year_built', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="1995"
            />
          </Field>
        </div>

        <Field label="Purchase Price ($)">
          <input
            type="number"
            className={INPUT_CLASSES}
            value={formData.purchase_price}
            onChange={(e) => updateField('purchase_price', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="25000000"
          />
        </Field>

        <Field label="Hero Image URL">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.hero_image_url}
            onChange={(e) => updateField('hero_image_url', e.target.value)}
            placeholder="https://..."
          />
        </Field>

        <Field label="Hero Video URL">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.hero_video_url}
            onChange={(e) => updateField('hero_video_url', e.target.value)}
            placeholder="https://... (MP4/WebM, optional looping background)"
          />
          <p className="text-xs text-gc-text-muted mt-1">Optional. Direct link to MP4/WebM for full-bleed looping background video. Leave empty to use hero image only.</p>
        </Field>

        <Field label="Deal Video URL">
          <input
            type="text"
            className={INPUT_CLASSES}
            value={formData.deal_video_url}
            onChange={(e) => updateField('deal_video_url', e.target.value)}
            placeholder="https://..."
          />
        </Field>
      </SectionCard>

      {/* Section 2: Capital Structure */}
      <SectionCard title="Capital Structure">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Total Raise / LP Equity ($)">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.total_raise}
              onChange={(e) => updateField('total_raise', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="15000000"
            />
          </Field>
          <Field label="GP Co-Invest ($)">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.gp_coinvest}
              onChange={(e) => updateField('gp_coinvest', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="500000"
            />
          </Field>
        </div>

        <Field label="Minimum Investment ($)">
          <input
            type="number"
            className={INPUT_CLASSES}
            value={formData.minimum_investment}
            onChange={(e) => updateField('minimum_investment', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="100000"
          />
        </Field>

        <Field label="Senior Debt / Loan Amount ($)">
          <input
            type="number"
            className={INPUT_CLASSES}
            value={formData.loan_amount}
            onChange={(e) => updateField('loan_amount', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="18000000"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Interest Rate (%)">
            <input
              type="number"
              step="0.01"
              className={INPUT_CLASSES}
              value={formData.interest_rate}
              onChange={(e) => updateField('interest_rate', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="5.25"
            />
          </Field>
          <Field label="IO Period (months)">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.io_period}
              onChange={(e) => updateField('io_period', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="24"
            />
          </Field>
        </div>

        <Field label="Loan Term (years)">
          <input
            type="number"
            className={INPUT_CLASSES}
            value={formData.loan_term}
            onChange={(e) => updateField('loan_term', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="5"
          />
        </Field>
      </SectionCard>

      {/* Section 3: Deal Terms */}
      <SectionCard title="Deal Terms">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preferred Return (%)">
            <input
              type="number"
              step="0.1"
              className={INPUT_CLASSES}
              value={formData.preferred_return}
              onChange={(e) => updateField('preferred_return', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="8"
            />
          </Field>
          <Field label="Pref Type">
            <select
              className={SELECT_CLASSES}
              value={formData.pref_type}
              onChange={(e) => updateField('pref_type', e.target.value)}
            >
              <option value="cumulative">Cumulative</option>
              <option value="non-cumulative">Non-cumulative</option>
            </select>
          </Field>
        </div>

        <Field label="GP Catch-Up">
          <select
            className={SELECT_CLASSES}
            value={formData.gp_catchup}
            onChange={(e) => updateField('gp_catchup', e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="LP Split (%)">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.lp_split}
              onChange={(e) => updateField('lp_split', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="70"
            />
          </Field>
          <Field label="GP Split (%)">
            <input
              type="number"
              className={INPUT_CLASSES}
              value={formData.gp_split}
              onChange={(e) => updateField('gp_split', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="30"
            />
          </Field>
        </div>
        {formData.lp_split !== '' && formData.gp_split !== '' && (
          Number(formData.lp_split) + Number(formData.gp_split) !== 100 && (
            <p className="text-xs text-amber-400">
              LP + GP split should equal 100% (currently {Number(formData.lp_split) + Number(formData.gp_split)}%)
            </p>
          )
        )}

        <Field label="Projected Hold Period (years)">
          <input
            type="number"
            className={INPUT_CLASSES}
            value={formData.hold_period}
            onChange={(e) => updateField('hold_period', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="5"
          />
        </Field>
      </SectionCard>

      {/* Section 4: Fee Structure */}
      <SectionCard title="Fee Structure">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Acquisition Fee (%)">
            <input
              type="number"
              step="0.1"
              className={INPUT_CLASSES}
              value={formData.acquisition_fee}
              onChange={(e) => updateField('acquisition_fee', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="2.0"
            />
          </Field>
          <Field label="Asset Management Fee (%)">
            <input
              type="number"
              step="0.1"
              className={INPUT_CLASSES}
              value={formData.asset_management_fee}
              onChange={(e) => updateField('asset_management_fee', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="1.5"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Construction Management Fee (%)">
            <input
              type="number"
              step="0.1"
              className={INPUT_CLASSES}
              value={formData.construction_management_fee}
              onChange={(e) => updateField('construction_management_fee', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="5.0"
            />
          </Field>
          <Field label="Disposition Fee (%)">
            <input
              type="number"
              step="0.1"
              className={INPUT_CLASSES}
              value={formData.disposition_fee}
              onChange={(e) => updateField('disposition_fee', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="1.0"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Section 5: Deal Status */}
      <SectionCard title="Deal Status">
        <Field label="Status">
          <select
            className={SELECT_CLASSES}
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="draft">Draft (invisible)</option>
            <option value="coming_soon">Coming soon</option>
            <option value="live">Live</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        {formData.status === 'live' && (
          <Field label={`Fundraise Progress (${formData.fundraise_progress}%)`}>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="w-full accent-gc-accent-light"
              value={formData.fundraise_progress}
              onChange={(e) => updateField('fundraise_progress', Number(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gc-text-secondary mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </Field>
        )}

        <Field label="Show Fundraise Progress">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_fundraise}
              onChange={(e) => updateField('show_fundraise', e.target.checked)}
              className="w-4 h-4 rounded border-gc-border bg-gc-bg text-gc-accent-light focus:ring-gc-accent-light accent-gc-accent-light"
            />
            <span className="text-sm text-gc-text-secondary">Display fundraise progress bar to investors</span>
          </label>
        </Field>

        {/* Publish / Go live / Unpublish — only for existing deals */}
        {!isNew && (
          <div className="pt-2 border-t border-gc-border flex flex-wrap gap-2">
            {formData.status === 'draft' && (
              <button
                onClick={() => handlePublishClick('publish')}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Publish Deal
              </button>
            )}
            {formData.status === 'coming_soon' && (
              <button
                onClick={() => handlePublishClick('golive')}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Go live
              </button>
            )}
            {formData.status === 'live' && (
              <button
                onClick={() => handlePublishClick('unpublish')}
                disabled={saving}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Unpublish
              </button>
            )}
          </div>
        )}
      </SectionCard>

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`px-4 py-3 rounded-lg text-sm ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gc-accent hover:bg-gc-accent-hover text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : isNew ? 'Create Deal' : 'Save Changes'}
        </button>
      </div>

      {/* Publish / Go live / Unpublish Confirm Dialog */}
      {showPublishConfirm && publishAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gc-surface border border-gc-border rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-gc-text">
              {publishAction === 'publish' && 'Publish Deal?'}
              {publishAction === 'golive' && 'Go live?'}
              {publishAction === 'unpublish' && 'Unpublish Deal?'}
            </h3>
            <p className="text-sm text-gc-text-secondary">
              {publishAction === 'publish' &&
                'This will make the deal visible to investors. Make sure all information is accurate before publishing.'}
              {publishAction === 'golive' &&
                'Make this deal live? Investors will have full access. Make sure all information is accurate.'}
              {publishAction === 'unpublish' &&
                'This will remove the deal from investor view. Existing links will no longer work.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPublishConfirm(false);
                  setPublishAction(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gc-text-secondary hover:text-gc-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPublish}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  publishAction === 'unpublish'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {publishAction === 'publish' && 'Publish'}
                {publishAction === 'golive' && 'Go live'}
                {publishAction === 'unpublish' && 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
