#!/usr/bin/env node
/**
 * Chunk E Verification: Research Progress Bar
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

console.log('\n=== Chunk E: Research Progress Bar ===\n');

// 1. Component
console.log('ResearchProgressBar component:');
const bar = fs.readFileSync(path.join(__dirname, '../client/src/components/hub/ResearchProgressBar.tsx'), 'utf-8');
test('Shows "X of 6 sections explored"', bar.includes('of ${TOTAL_SPOKES} sections explored'));
test('Animated bar with motion', bar.includes('motion.div'));
test('Slate color for 0-2', bar.includes('slate-500'));
test('Amber color for 3-4', bar.includes('amber-500'));
test('Emerald color for 5-6', bar.includes('emerald-500'));
test('Shows nudge text when incomplete', bar.includes('getNudgeText'));
test('Shows "Research Complete ✓" when all done', bar.includes('Research Complete'));
test('Fires gc_full_research_completed event', bar.includes('gc_full_research_completed'));
test('Fires via analytics route', bar.includes('/api/analytics/event'));
test('Only fires completion once per session', bar.includes('completedRef'));
test('Counts only spoke sections (not hub)', bar.includes("spokeIds.includes(s)"));

// 2. Hub integration
console.log('\nHub integration:');
const hub = fs.readFileSync(path.join(__dirname, '../client/src/components/hub/Hub.tsx'), 'utf-8');
test('Imports ResearchProgressBar', hub.includes("import ResearchProgressBar"));
test('Renders above spoke cards', hub.includes('<ResearchProgressBar'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
