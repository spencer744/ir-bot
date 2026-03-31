#!/usr/bin/env node
/**
 * Chunk F Verification: Intake → HubSpot Field Alignment
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

console.log('\n=== Chunk F: Intake → HubSpot Field Alignment ===\n');

// 1. Intake form questions
console.log('Intake form:');
const intake = fs.readFileSync(path.join(__dirname, '../client/src/components/gate/Intake.tsx'), 'utf-8');
test('Has investment_goal question', intake.includes("key: 'investment_goal'"));
test('Has syndication_experience question', intake.includes("key: 'syndication_experience'"));
test('Has target_range question', intake.includes("key: 'target_range'"));
test('Has target_hold_period question', intake.includes("key: 'target_hold_period'"));
test('Has key_concerns question', intake.includes("key: 'key_concerns'"));
test('Has lead_source question', intake.includes("key: 'lead_source'"));
test('Total 6 questions', (intake.match(/key: '/g) || []).length === 6);

// 2. TypeScript types
console.log('\nIntakeAnswers type:');
const types = fs.readFileSync(path.join(__dirname, '../client/src/types/investor.ts'), 'utf-8');
test('Has target_hold_period field', types.includes('target_hold_period'));
test('Has key_concerns field', types.includes('key_concerns'));

// 3. HubSpot field mapping
console.log('\nHubSpot field mapping:');
const hubspot = fs.readFileSync(path.join(__dirname, '../server/src/services/hubspot.js'), 'utf-8');
test('Maps investment_goal → gc_investment_goal', hubspot.includes("investment_goal: 'gc_investment_goal'"));
test('Maps syndication_experience → gc_syndication_experience', hubspot.includes("syndication_experience: 'gc_syndication_experience'"));
test('Maps target_range → gc_target_range', hubspot.includes("target_range: 'gc_target_range'"));
test('Maps lead_source → gc_lead_source', hubspot.includes("lead_source: 'gc_lead_source'"));
test('Maps target_hold_period → gc_target_hold_period', hubspot.includes("target_hold_period: 'gc_target_hold_period'"));
test('Maps key_concerns → gc_key_concerns', hubspot.includes("key_concerns: 'gc_key_concerns'"));
test('Sets gc_current_deal on registration', hubspot.includes('gc_current_deal'));

// 4. Backend intake handler
console.log('\nBackend intake handler:');
const chatRoute = fs.readFileSync(path.join(__dirname, '../server/src/routes/chat.js'), 'utf-8');
test('Persists target_hold_period to Supabase', chatRoute.includes('target_hold_period'));
test('Persists key_concerns to Supabase', chatRoute.includes('key_concerns'));

// 5. Migration
console.log('\nMigration:');
const migration = fs.readFileSync(path.join(__dirname, '../server/migrations/011_investor_intake_fields.sql'), 'utf-8');
test('Adds target_hold_period column', migration.includes('target_hold_period'));
test('Adds key_concerns column', migration.includes('key_concerns'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
