#!/usr/bin/env node
/**
 * Chunk G Verification: Analytics Pagination + Supabase Index
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

console.log('\n=== Chunk G: Analytics Pagination + Supabase Index ===\n');

// 1. Backend route
console.log('Backend GET /api/analytics/admin/analytics/:dealSlug:');
const analytics = fs.readFileSync(path.join(__dirname, '../server/src/routes/analytics.js'), 'utf-8');
test('Has paginated analytics endpoint', analytics.includes("'/admin/analytics/:dealSlug'"));
test('Supports page param', analytics.includes('req.query.page'));
test('Supports per_page param', analytics.includes('req.query.per_page'));
test('Supports from date filter', analytics.includes('req.query.from'));
test('Supports to date filter', analytics.includes('req.query.to'));
test('Returns pagination object', analytics.includes('total_pages'));
test('Returns has_prev/has_next', analytics.includes('has_prev') && analytics.includes('has_next'));
test('Uses Supabase range for offset', analytics.includes('.range(offset'));
test('Demo mode fallback with pagination', analytics.includes('paginated'));
test('Max per_page capped at 200', analytics.includes('200'));

// 2. Migration
console.log('\nMigration:');
const migration = fs.readFileSync(path.join(__dirname, '../server/migrations/012_deal_events_index.sql'), 'utf-8');
test('Creates idx_deal_events_deal_slug index', migration.includes('idx_deal_events_deal_slug'));
test('Index on deal_slug + created_at DESC', migration.includes('deal_slug, created_at DESC'));

// 3. Admin UI
console.log('\nAdmin UI:');
const adminTab = fs.readFileSync(path.join(__dirname, '../client/src/components/admin/DealAnalyticsTab.tsx'), 'utf-8');
test('Has events state', adminTab.includes('setEvents'));
test('Has pagination state', adminTab.includes('setEventsPagination'));
test('Has prev/next buttons', adminTab.includes('Prev') && adminTab.includes('Next'));
test('Shows page number', adminTab.includes('eventsPage'));
test('Shows total events count', adminTab.includes('eventsPagination.total'));
test('Fetches from paginated endpoint', adminTab.includes('/api/analytics/admin/analytics/'));
test('Lazy-loads events (Load Events button)', adminTab.includes('showEvents'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
