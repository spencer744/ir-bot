#!/usr/bin/env node
/**
 * Chunk H Verification: Dormancy Endpoint
 */

const fs = require('fs');
const path = require('path');

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) { console.log(`  ${PASS} ${name}`); passed++; }
  else { console.log(`  ${FAIL} ${name}`); failed++; }
}

console.log('\n=== Chunk H: Dormancy Endpoint ===\n');

// 1. Backend route
console.log('Backend GET /api/analytics/admin/dormant-investors:');
const analytics = fs.readFileSync(path.join(__dirname, '../server/src/routes/analytics.js'), 'utf-8');
test('Has dormant-investors endpoint', analytics.includes("'/admin/dormant-investors'"));
test('Accepts ?days query param', analytics.includes('req.query.days'));
test('Default 14 days', analytics.includes('|| 14'));
test('Calculates cutoff date', analytics.includes('cutoffDate'));
test('Queries sessions with lt(last_active_at)', analytics.includes(".lt('last_active_at'"));
test('Returns investor_id', analytics.includes('investor_id'));
test('Returns email', analytics.includes('email'));
test('Returns name', analytics.includes('name'));
test('Returns last_seen', analytics.includes('last_seen'));
test('Returns deal_slug', analytics.includes('deal_slug'));
test('Returns engagement_score', analytics.includes('engagement_score'));
test('Deduplicates by investor', analytics.includes('investorMap'));
test('Returns count', analytics.includes("count: dormant.length"));
test('Protected by requireAdmin (under admin router)', analytics.includes("router.use('/admin', requireAdmin)"));
test('Demo mode returns empty array', analytics.includes('dormant_investors: []'));

// 2. Documentation
console.log('\nDocs/HUBSPOT.md:');
const docs = fs.readFileSync(path.join(__dirname, '../docs/HUBSPOT.md'), 'utf-8');
test('Documents dormancy endpoint', docs.includes('Dormancy Data Feed'));
test('Documents query params', docs.includes('days'));
test('Documents response shape', docs.includes('dormant_investors'));
test('Documents HubSpot workflow integration', docs.includes('workflow'));
test('Documents investor readiness tiers', docs.includes('Investor Readiness'));
test('Documents scoring formula', docs.includes('sections_viewed × 8'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
