const fs = require('fs');
const path = require('path');

const KB_DIR = path.join(__dirname, '..', '..', 'kb');

// Topic → KB file mapping (V1: keyword regex matching)
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

  // PODCAST
  'podcast|interview|spencer said|your view on|market outlook|rates|economy':
    ['firm/podcast-spencer-philosophy.md', 'firm/podcast-market-views.md'],

  // FAQ TOPICS
  'distribute|distribution|cash flow|quarterly|when do i get paid|payout':
    ['faq/faq-returns-distributions.md'],

  'tax|depreci|k-?1|cost seg|passive|deduct|write.?off|phantom':
    ['faq/faq-tax-depreciation.md'],

  'risk|downside|what.?if|go wrong|lose|protect|recession|default|worst case':
    ['faq/faq-risk-downside.md'],

  'fee|acquisition fee|asset management|promote|carried interest|gp compensation':
    ['faq/faq-fees-structure.md'],

  'liquid|sell|exit|hold period|get my money|redeem|how long':
    ['faq/faq-liquidity-exit.md'],

  'process|how do i invest|subscribe|wire|next step|get started|timeline':
    ['faq/faq-process-timeline.md'],

  // DEAL-SPECIFIC
  'property|building|unit|amenit|renovati|apartment|floor plan|condition':
    ['deal/[slug]/property-details.md', 'deal/[slug]/business-plan.md'],

  'market|submarket|employment|population|rent comp|supply|demand|metro':
    ['deal/[slug]/market-analysis.md'],

  'return|irr|equity multiple|cash.?on.?cash|project|scenario|upside|base case':
    ['deal/[slug]/financial-summary.md', 'deal/[slug]/sensitivity-context.md'],

  'business plan|value.?add|renovation|improve|upgrade|rent growth|noi':
    ['deal/[slug]/business-plan.md'],

  'terms|structure|pref|preferred|waterfall|split|minimum|invest amount':
    ['deal/[slug]/terms-and-fees.md'],

  // EDUCATION
  'what is a syndication|how does this work|explain|new to this|first time':
    ['reference/ref-syndication-101.md', 'reference/ref-understanding-returns.md'],

  'accredited|qualify|requirement|who can invest':
    ['reference/ref-accredited-investor.md'],

  'ppm|memorandum|legal document|offering document|what should i look for':
    ['reference/ref-reading-a-ppm.md'],
};

const ALWAYS_LOAD = ['deal/[slug]/deal-overview.md'];

const SECTION_MAP = {
  financials: ['deal/[slug]/financial-summary.md', 'deal/[slug]/terms-and-fees.md'],
  property: ['deal/[slug]/property-details.md'],
  market: ['deal/[slug]/market-analysis.md'],
  team: ['firm/team-spencer-gray.md', 'firm/team-gray-residential.md'],
  business: ['deal/[slug]/business-plan.md'],
};

const PROFILE_MAP = {
  first_time: ['reference/ref-syndication-101.md'],
  tax_benefits: ['faq/faq-tax-depreciation.md'],
  cash_flow: ['faq/faq-returns-distributions.md'],
};

function selectKBModules(message, currentSection, investorProfile, dealSlug) {
  const modules = new Set(ALWAYS_LOAD.map(f => f.replace('[slug]', dealSlug)));

  // Match message against topic map
  for (const [pattern, files] of Object.entries(TOPIC_MAP)) {
    if (new RegExp(pattern, 'i').test(message)) {
      files.forEach(f => modules.add(f.replace('[slug]', dealSlug)));
    }
  }

  // Section-aware context
  if (SECTION_MAP[currentSection]) {
    SECTION_MAP[currentSection].forEach(f =>
      modules.add(f.replace('[slug]', dealSlug))
    );
  }

  // Profile-aware context
  if (investorProfile?.syndication_experience === 'first_time') {
    PROFILE_MAP.first_time.forEach(f => modules.add(f));
  }
  if (investorProfile?.investment_goal) {
    const profileFiles = PROFILE_MAP[investorProfile.investment_goal];
    if (profileFiles) profileFiles.forEach(f => modules.add(f));
  }

  return Array.from(modules);
}

function loadKBFile(filePath) {
  const fullPath = path.join(KB_DIR, filePath);
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf-8');
    }
  } catch {
    // File not found — skip silently
  }
  return null;
}

function loadKBModules(modulePaths) {
  const contents = [];
  for (const filePath of modulePaths) {
    const content = loadKBFile(filePath);
    if (content) {
      contents.push({ path: filePath, content });
    }
  }
  return contents;
}

module.exports = { selectKBModules, loadKBFile, loadKBModules };
