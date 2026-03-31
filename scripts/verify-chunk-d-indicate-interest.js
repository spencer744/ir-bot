#!/usr/bin/env node
/**
 * Chunk D Verification: Indicate Interest Flow
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

console.log('\n=== Chunk D: Indicate Interest Flow ===\n');

// 1. Backend endpoint
console.log('Backend POST /api/deal/:slug/interest:');
const dealRoute = fs.readFileSync(path.join(__dirname, '../server/src/routes/deal.js'), 'utf-8');
test('Has POST /:slug/interest route', dealRoute.includes("'/:slug/interest'"));
test('Requires auth', dealRoute.includes('requireAuth'));
test('Validates amount', dealRoute.includes("!amount"));
test('Saves to investor_interests table', dealRoute.includes("investor_interests"));
test('Creates HubSpot Deal', dealRoute.includes('createDeal('));
test('Creates HubSpot Note', dealRoute.includes('createNote('));
test('Updates HubSpot contact properties', dealRoute.includes('gc_interest_indicated'));
test('Marks session as interest_indicated', dealRoute.includes("interest_indicated: true"));
test('Notes trimmed to 500 chars', dealRoute.includes('.slice(0, 500)'));

// 2. HubSpot createDeal
console.log('\nHubSpot createDeal:');
const hubspot = fs.readFileSync(path.join(__dirname, '../server/src/services/hubspot.js'), 'utf-8');
test('Exports createDeal function', hubspot.includes('async function createDeal'));
test('Creates deal via basicApi', hubspot.includes('hs.crm.deals.basicApi.create'));
test('Associates deal with contact', hubspot.includes('hs.crm.deals.associationsApi'));

// 3. Migration
console.log('\nMigration:');
const migration = fs.readFileSync(path.join(__dirname, '../server/migrations/010_investor_interests.sql'), 'utf-8');
test('Creates investor_interests table', migration.includes('CREATE TABLE IF NOT EXISTS investor_interests'));
test('Has investor_id FK', migration.includes('REFERENCES investors(id)'));
test('Has deal_slug column', migration.includes('deal_slug'));
test('Has amount column', migration.includes('amount'));
test('Has timeline column', migration.includes('timeline'));
test('Has notes column', migration.includes('notes'));
test('Has RLS enabled', migration.includes('ROW LEVEL SECURITY'));

// 4. Frontend modal
console.log('\nFrontend IndicateInterestModal:');
const modal = fs.readFileSync(path.join(__dirname, '../client/src/components/hub/IndicateInterestModal.tsx'), 'utf-8');
test('Has amount options ($50K-$1M+, Custom)', modal.includes("'$50K'") && modal.includes("'$1M+'") && modal.includes("'Custom'"));
test('Has timeline dropdown', modal.includes('TIMELINES'));
test('Has notes textarea with 500 max', modal.includes('maxLength={500}'));
test('Posts to /api/deal/:slug/interest', modal.includes('/interest'));
test('Shows confirmation state', modal.includes('Interest Received'));
test('Non-binding disclaimer', modal.includes('non-binding'));

// 5. Frontend card
console.log('\nFrontend IndicateInterestCard:');
const card = fs.readFileSync(path.join(__dirname, '../client/src/components/hub/IndicateInterestCard.tsx'), 'utf-8');
test('Shows only when visible prop true', card.includes('if (!visible) return null'));
test('Shows "Interest Indicated ✓" after submit', card.includes('Interest Indicated'));
test('Opens modal on click', card.includes('setModalOpen(true)'));

// 6. Hub integration
console.log('\nHub integration:');
const hub = fs.readFileSync(path.join(__dirname, '../client/src/components/hub/Hub.tsx'), 'utf-8');
test('Imports IndicateInterestCard', hub.includes("import IndicateInterestCard"));
test('Shows after 3+ spokes visited', hub.includes('>= 3'));
test('Filters out hub from count', hub.includes("s !== 'hub'"));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
