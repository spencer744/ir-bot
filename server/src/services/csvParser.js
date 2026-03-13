'use strict';

// ---------------------------------------------------------------------------
// CSV Parser for Deal Import
// Handles two formats: deal_overview.csv (field/value pairs) and
// deal_sensitivity.csv (sectioned data with [section_name] markers).
// Pure string parsing — no external dependencies.
// ---------------------------------------------------------------------------

function stripBOM(str) {
  return str.charCodeAt(0) === 0xFEFF ? str.slice(1) : str;
}

function normalizeLineEndings(str) {
  return str.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toNumber(val) {
  if (val === '' || val === null || val === undefined) return null;
  const str = String(val).trim().replace(/[$,%]/g, '');
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

// ---------------------------------------------------------------------------
// RFC-4180-ish CSV line parser that handles quoted fields with embedded
// commas, newlines, and escaped quotes ("").
// Returns an array of arrays (rows × columns).
// ---------------------------------------------------------------------------
function parseCSVLines(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        row.push(field);
        field = '';
        i++;
      } else if (ch === '\n') {
        row.push(field);
        field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Flush last field/row
  row.push(field);
  if (row.length > 1 || row[0] !== '') rows.push(row);

  return rows;
}

// ---------------------------------------------------------------------------
// parseOverviewCSV — two-column field,value CSV
// ---------------------------------------------------------------------------
function parseOverviewCSV(csvString) {
  const warnings = [];
  const fields = {};

  if (!csvString || typeof csvString !== 'string') {
    warnings.push('Empty or invalid CSV input');
    return { fields, warnings };
  }

  const text = normalizeLineEndings(stripBOM(csvString.trim()));
  const rows = parseCSVLines(text);

  if (rows.length === 0) {
    warnings.push('CSV contains no data rows');
    return { fields, warnings };
  }

  // Detect and skip header row
  const first = rows[0];
  const isHeader =
    first.length >= 2 &&
    first[0].trim().toLowerCase() === 'field' &&
    first[1].trim().toLowerCase() === 'value';

  const dataRows = isHeader ? rows.slice(1) : rows;

  for (const row of dataRows) {
    const key = (row[0] || '').trim();
    if (!key) continue;

    // Value is everything after the first comma (re-joined in case of unquoted commas)
    const value = row.slice(1).join(',').trim();
    fields[key] = value;
  }

  return { fields, warnings };
}

// ---------------------------------------------------------------------------
// parseSensitivityCSV — sectioned CSV with [section_name] markers
// ---------------------------------------------------------------------------
function parseSensitivityCSV(csvString) {
  const warnings = [];
  const sections = {};

  if (!csvString || typeof csvString !== 'string') {
    warnings.push('Empty or invalid CSV input');
    return { sections, warnings };
  }

  const text = normalizeLineEndings(stripBOM(csvString.trim()));
  const lines = text.split('\n');

  let currentSection = null;
  let sectionLines = [];

  function flushSection() {
    if (!currentSection || sectionLines.length === 0) return;

    const parsed = parseCSVLines(sectionLines.join('\n'));
    if (parsed.length < 2) {
      warnings.push(`Section [${currentSection}] has no data rows`);
      sections[currentSection] = [];
      return;
    }

    const headers = parsed[0].map((h) => h.trim());
    const rows = [];

    for (let r = 1; r < parsed.length; r++) {
      const cells = parsed[r];
      const obj = {};
      for (let c = 0; c < headers.length; c++) {
        const key = headers[c];
        if (!key) continue;
        obj[key] = (cells[c] || '').trim();
      }
      // Skip rows where every value is empty
      if (Object.values(obj).every((v) => v === '')) continue;
      rows.push(obj);
    }

    sections[currentSection] = rows;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      flushSection();
      currentSection = sectionMatch[1].trim();
      sectionLines = [];
    } else if (currentSection !== null) {
      sectionLines.push(rawLine);
    }
  }

  flushSection();

  return { sections, warnings };
}

// ---------------------------------------------------------------------------
// buildDealPayload — flat fields map → nested deal object for Supabase
// ---------------------------------------------------------------------------
function buildDealPayload(fields) {
  const warnings = [];

  function str(key) {
    return fields[key] !== undefined ? String(fields[key]).trim() : '';
  }

  function num(key) {
    return toNumber(fields[key]);
  }

  // Required field validation
  const required = ['name', 'total_units', 'purchase_price'];
  for (const key of required) {
    if (!str(key)) {
      warnings.push(`Missing required field: ${key}`);
    }
  }

  const name = str('name');
  const slug = str('slug') || slugify(name);

  const lpSplit = num('lp_split');
  const gpSplit = num('gp_split');
  const prefRate = num('pref_rate');

  // Normalize LP/GP splits: if provided as whole numbers (e.g. 70/30), convert to decimals
  let lpFrac = lpSplit;
  let gpFrac = gpSplit;
  if (lpFrac !== null && lpFrac > 1) lpFrac = lpFrac / 100;
  if (gpFrac !== null && gpFrac > 1) gpFrac = gpFrac / 100;

  const deal = {
    name,
    slug,
    status: 'draft',
    property_address: str('property_address'),
    city: str('city'),
    state: str('state'),
    total_units: num('total_units'),
    total_raise: num('total_raise'),
    min_investment: num('min_investment'),
    purchase_price: num('purchase_price'),
    projected_hold_years: num('projected_hold_years'),
    target_irr_base: num('target_irr_base'),
    target_equity_multiple: num('target_equity_multiple'),
    target_coc: num('target_coc'),
    hero_image_url: str('hero_image_url'),
    video_url: str('video_url'),
    market_analysis_md: str('market_analysis_md'),
    business_plan_md: str('business_plan_md'),
    fundraise_pct: num('fundraise_pct'),

    waterfall_terms: {
      pref_rate: prefRate,
      pref_type: str('pref_type') || 'cumulative',
      pref_basis: str('pref_basis') || 'committed_capital',
      hurdle_1_irr: null,
      split_below_hurdle: { lp: 1, gp: 0 },
      hurdle_1_rate: prefRate,
      split_above_hurdle_1: {
        lp: lpFrac !== null ? lpFrac : 0.70,
        gp: gpFrac !== null ? gpFrac : 0.30,
      },
      catch_up: str('catch_up') === 'true',
    },

    deal_terms: {
      total_raise: num('total_raise'),
      min_investment: num('min_investment'),
      projected_hold_years: num('projected_hold_years'),
      purchase_price: num('purchase_price'),
      total_units: num('total_units'),
      loan_amount: num('loan_amount'),
      interest_rate: num('interest_rate'),
    },

    cost_seg_data: {
      year_1_accelerated_depreciation_pct: num('cost_seg_year1_depr_pct'),
      total_depreciable_basis: num('cost_seg_depreciable_basis'),
      estimated_year_1_paper_loss_per_100k: num('cost_seg_year1_paper_loss_per_100k'),
    },

    benchmark_rates: {
      savings: num('benchmark_savings'),
      treasury_10yr: num('benchmark_treasury_10yr'),
      muni_bond: num('benchmark_muni_bond'),
      sp500_avg: num('benchmark_sp500_avg'),
    },

    fees: {
      acquisition_fee_pct: num('acquisition_fee_pct'),
      loan_guarantee_fee_pct: num('loan_guarantee_fee_pct'),
      asset_management_fee_pct: num('asset_management_fee_pct'),
      property_management_fee_pct: num('property_management_fee_pct'),
      disposition_fee_pct: num('disposition_fee_pct'),
    },
  };

  return { deal, warnings };
}

// ---------------------------------------------------------------------------
// buildSensitivityPayload — parsed sections → SensitivityData JSON
// ---------------------------------------------------------------------------
function buildSensitivityPayload(sections, dealSlug, dealFields) {
  const warnings = [];

  // --- Scenarios ---
  const scenarioRows = sections.scenarios || [];
  const SCENARIO_KEYS = ['downside', 'base', 'upside', 'strategic'];
  const scenarios = {};

  for (const row of scenarioRows) {
    const key = (row.scenario || '').trim().toLowerCase();
    if (!SCENARIO_KEYS.includes(key)) {
      warnings.push(`Unknown scenario key: "${key}"`);
      continue;
    }
    scenarios[key] = {
      label: row.label || key.charAt(0).toUpperCase() + key.slice(1),
      assumptions: {
        annual_rent_growth: toNumber(row.annual_rent_growth),
        exit_cap: toNumber(row.exit_cap),
        avg_occupancy: toNumber(row.avg_occupancy),
        annual_expense_growth: toNumber(row.annual_expense_growth),
      },
      returns: {
        lp_irr: toNumber(row.lp_irr),
        equity_multiple: toNumber(row.equity_multiple),
        avg_coc: toNumber(row.avg_coc),
        distribution_per_100k: toNumber(row.distribution_per_100k),
      },
    };
  }

  for (const key of SCENARIO_KEYS) {
    if (!scenarios[key]) {
      warnings.push(`Missing scenario: ${key}`);
    }
  }

  // --- Sensitivity tables ---
  const TABLE_SECTIONS = [
    'rent_growth_vs_irr',
    'exit_cap_vs_irr',
    'occupancy_vs_irr',
    'rent_growth_x_exit_cap',
  ];

  const sensitivity_tables = {};
  for (const tableName of TABLE_SECTIONS) {
    const rows = sections[tableName] || [];
    if (rows.length === 0) {
      warnings.push(`Missing or empty sensitivity table: ${tableName}`);
    }
    sensitivity_tables[tableName] = rows.map((row) => {
      const numRow = {};
      for (const [k, v] of Object.entries(row)) {
        numRow[k] = toNumber(v);
      }
      return numRow;
    });
  }

  // --- Annual cash flows ---
  const cashFlowRows = sections.annual_cash_flows || [];
  const annual_cash_flows = { downside: {}, base: {}, upside: {}, strategic: {} };

  for (const row of cashFlowRows) {
    const scenario = (row.scenario || '').trim().toLowerCase();
    if (!annual_cash_flows[scenario]) {
      warnings.push(`Unknown cash flow scenario: "${scenario}"`);
      continue;
    }
    const yearNum = toNumber(row.year);
    const yearKey = yearNum !== null ? `year_${yearNum}` : null;
    if (!yearKey) {
      warnings.push('Cash flow row missing year');
      continue;
    }
    annual_cash_flows[scenario][yearKey] = {
      noi: toNumber(row.noi),
      debt_service: toNumber(row.debt_service),
      cash_flow_to_equity: toNumber(row.cash_flow_to_equity),
      distribution_per_unit: toNumber(row.distribution_per_unit),
    };
  }

  // --- Waterfall, deal_terms, cost_seg from dealFields ---
  const { deal: builtDeal } = dealFields
    ? buildDealPayload(dealFields)
    : { deal: {} };

  const payload = {
    deal_slug: dealSlug || builtDeal.slug || '',
    scenarios,
    sensitivity_tables,
    annual_cash_flows,
    waterfall: builtDeal.waterfall_terms || {
      pref_rate: null,
      pref_type: 'cumulative',
      pref_basis: 'committed_capital',
      hurdle_1_irr: null,
      split_below_hurdle: { lp: 1, gp: 0 },
      hurdle_1_rate: null,
      split_above_hurdle_1: { lp: 0.70, gp: 0.30 },
      catch_up: false,
    },
    deal_terms: builtDeal.deal_terms || {
      total_raise: null,
      min_investment: null,
      projected_hold_years: null,
      purchase_price: null,
      total_units: null,
      loan_amount: null,
      interest_rate: null,
    },
    cost_seg: builtDeal.cost_seg_data || {
      year_1_accelerated_depreciation_pct: null,
      total_depreciable_basis: null,
      estimated_year_1_paper_loss_per_100k: null,
    },
  };

  // Pass through unit_mix so the import route can add it to the deal
  const unitMixRows = sections.unit_mix || [];
  const unit_mix = unitMixRows.map((row) => ({
    type: (row.type || '').trim(),
    count: toNumber(row.count),
    avg_sf: toNumber(row.avg_sf),
    current_rent: toNumber(row.current_rent),
    pro_forma_rent: toNumber(row.pro_forma_rent),
  })).filter((r) => r.type);

  return { sensitivity: payload, unit_mix, warnings };
}

module.exports = {
  parseOverviewCSV,
  parseSensitivityCSV,
  buildDealPayload,
  buildSensitivityPayload,
};
