const fs = require('fs');
const path = require('path');

const KB_BASE_PATH = path.join(__dirname, '../../kb');

// Topic → file mapping (regex patterns)
const TOPIC_MAP = {
  // GRAY CAPITAL COMPANY
  'gray capital|about you|your company|who are you|your firm|how long':
    ['firm/history-and-mission.md'],

  'philosophy|approach|strategy|why midwest|thesis|criteria':
    ['firm/investment-philosophy-deep.md'],

  // TEAM
  'spencer|founder|ceo|who started|leadership':
    ['firm/team-spencer-gray.md', 'firm/team-leadership.md'],

  'team|who manages|management company|property management|gray residential|maintenance':
    ['firm/team-gray-residential.md', 'firm/gray-residential-ops.md'],

  // TRACK RECORD
  'track record|past deals|performance|history|previous|returns you.ve|how have you done':
    ['firm/track-record-full.md', 'firm/track-record-case-studies.md'],

  'testimonial|other investors|investor experience|what do investors say|reviews':
    ['firm/lp-testimonials.md', 'firm/investor-experience.md'],

  // PODCAST / SPENCER'S VIEWS
  'podcast|interview|spencer said|your view on|market outlook|rates|economy':
    ['firm/podcast-spencer-philosophy.md', 'firm/podcast-market-views.md'],

  // FAQ TOPICS
  'distribut|cash flow|quarterly|when do i get paid|payout':
    ['faq/faq-returns-distributions.md'],

  'tax|depreci|k-?1|cost seg|passive|deduct|write.?off|phantom':
    ['faq/faq-tax-depreciation.md', 'deal/[slug]/cost-seg-tax.md'],

  'risk|downside|what.?if|go wrong|lose|protect|recession|default|worst case':
    ['faq/faq-risk-downside.md', 'deal/[slug]/sensitivity-context.md'],

  'fee|acquisition fee|asset management|promote|carried interest|gp compensation|how.*make money':
    ['faq/faq-fees-structure.md', 'deal/[slug]/terms-and-fees.md'],

  'liquid|sell|exit|hold period|get my money|redeem|how long':
    ['faq/faq-liquidity-exit.md'],

  'process|how do i invest|subscribe|wire|next step|get started|timeline|how.*invest':
    ['faq/faq-process-timeline.md'],

  // DEAL-SPECIFIC
  'property|building|unit mix|amenit|renovati|apartment|floor plan|condition':
    ['deal/[slug]/property-details.md', 'deal/[slug]/business-plan.md'],

  'market|submarket|employment|population|rent comp|supply|demand|metro|indianapolis':
    ['deal/[slug]/market-analysis.md'],

  'return|irr|equity multiple|cash.?on.?cash|project|scenario|upside|base case|conservative':
    ['deal/[slug]/financial-summary.md', 'deal/[slug]/sensitivity-context.md'],

  'business plan|value.?add|renovation|improve|upgrade|rent growth|noi':
    ['deal/[slug]/business-plan.md'],

  'terms|structure|pref|preferred|waterfall|split|minimum|invest amount':
    ['deal/[slug]/terms-and-fees.md'],

  // EDUCATION
  'what is a syndication|how does this work|explain|new to this|first time|never invested':
    ['reference/ref-syndication-101.md', 'reference/ref-understanding-returns.md'],

  'accredited|qualify|requirement|who can invest':
    ['reference/ref-accredited-investor.md'],

  'ppm|memorandum|legal document|offering document|what should i look for':
    ['reference/ref-reading-a-ppm.md'],
};

// Always loaded for baseline context (core firm + current deal)
const ALWAYS_LOAD = ['firm/gray-capital-background.md', 'deal/[slug]/deal-overview.md'];

// Section-aware loading (when investor is viewing a specific spoke)
const SECTION_MAP = {
  'financials': ['deal/[slug]/financial-summary.md', 'deal/[slug]/terms-and-fees.md'],
  'property': ['deal/[slug]/property-details.md'],
  'market': ['deal/[slug]/market-analysis.md'],
  'team': ['firm/team-spencer-gray.md', 'firm/team-gray-residential.md'],
  'business-plan': ['deal/[slug]/business-plan.md'],
  'documents': ['faq/faq-process-timeline.md'],
};

// Investor profile-aware loading
const PROFILE_MAP = {
  'first_time': ['reference/ref-syndication-101.md'],
  'tax_benefits': ['faq/faq-tax-depreciation.md'],
  'cash_flow': ['faq/faq-returns-distributions.md'],
};

// Fallback files when no patterns match
const FALLBACK_FILES = [
  'firm/history-and-mission.md',
  'faq/faq-general.md',
];

/**
 * Select which KB modules to load for a chat request.
 *
 * @param {string} message - The investor's message
 * @param {string} currentSection - Which spoke they're currently viewing
 * @param {object} investorProfile - { syndication_experience, investment_goal, ... }
 * @param {string} dealSlug - Current deal slug
 * @returns {string[]} Array of file paths to load
 */
function selectKBModules(message, currentSection, investorProfile, dealSlug) {
  const modules = new Set();

  // Always load deal overview
  ALWAYS_LOAD.forEach(f => modules.add(f.replace('[slug]', dealSlug)));

  // Match message against topic map
  let matched = false;
  for (const [pattern, files] of Object.entries(TOPIC_MAP)) {
    if (new RegExp(pattern, 'i').test(message)) {
      files.forEach(f => modules.add(f.replace('[slug]', dealSlug)));
      matched = true;
    }
  }

  // Add section-aware context
  if (currentSection && SECTION_MAP[currentSection]) {
    SECTION_MAP[currentSection].forEach(f =>
      modules.add(f.replace('[slug]', dealSlug))
    );
  }

  // Add profile-aware context
  if (investorProfile) {
    if (investorProfile.syndication_experience === 'first_time') {
      PROFILE_MAP['first_time'].forEach(f => modules.add(f));
    }
    if (investorProfile.investment_goal === 'tax_benefits') {
      PROFILE_MAP['tax_benefits'].forEach(f => modules.add(f));
    }
    if (investorProfile.investment_goal === 'cash_flow') {
      PROFILE_MAP['cash_flow'].forEach(f => modules.add(f));
    }
  }

  // If nothing matched, load fallbacks
  if (!matched) {
    FALLBACK_FILES.forEach(f => modules.add(f));
  }

  return Array.from(modules);
}

/**
 * Load KB file contents from disk.
 * Returns array of { path, content, tokens (estimated) }
 */
async function loadKBFiles(filePaths) {
  const results = [];
  let totalTokens = 0;
  const TOKEN_BUDGET = 15000; // Max ~15K tokens of KB content per request

  // Priority order: deal-specific > faq > firm > reference
  const prioritized = filePaths.sort((a, b) => {
    const priority = { 'deal/': 0, 'faq/': 1, 'firm/': 2, 'reference/': 3 };
    const pa = Object.entries(priority).find(([k]) => a.startsWith(k))?.[1] ?? 4;
    const pb = Object.entries(priority).find(([k]) => b.startsWith(k))?.[1] ?? 4;
    return pa - pb;
  });

  for (const filePath of prioritized) {
    try {
      const fullPath = path.join(KB_BASE_PATH, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const estimatedTokens = Math.ceil(content.length / 4); // rough estimate

      if (totalTokens + estimatedTokens > TOKEN_BUDGET) {
        console.log(`KB token budget reached. Skipping: ${filePath}`);
        break;
      }

      results.push({ path: filePath, content, tokens: estimatedTokens });
      totalTokens += estimatedTokens;
    } catch (err) {
      console.warn(`KB file not found: ${filePath}`);
    }
  }

  return results;
}

/**
 * Get a summary of all KB files for admin/debugging
 */
function getKBInventory() {
  const inventory = [];

  function scanDir(dir) {
    const fullDir = path.join(KB_BASE_PATH, dir);
    if (!fs.existsSync(fullDir)) return;
    const items = fs.readdirSync(fullDir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const fullPath = path.join(KB_BASE_PATH, itemPath);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDir(itemPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        inventory.push({
          path: itemPath,
          category: dir.split(/[/\\]/)[0], // firm, faq, reference, deal
          title: content.split('\n')[0].replace(/^#\s*/, ''),
          size_bytes: stat.size,
          estimated_tokens: Math.ceil(content.length / 4),
          updated_at: stat.mtime.toISOString(),
        });
      }
    }
  }

  scanDir('');
  return inventory;
}

module.exports = { selectKBModules, loadKBFiles, getKBInventory };
