#!/usr/bin/env node
/**
 * Chunk C Verification: Engagement Score → HubSpot Investor Readiness
 */

const path = require('path');
const fs = require('fs');

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) { console.log(`  ${PASS} ${name}`); passed++; }
  else { console.log(`  ${FAIL} ${name}`); failed++; }
}

console.log('\n=== Chunk C: Engagement Score → HubSpot Investor Readiness ===\n');

// 1. Test scoring formula
const { calculateEngagementScore, getInvestorReadiness } = require(path.join(__dirname, '../server/src/services/engagement'));

console.log('Scoring formula:');

// Test: 6 sections(48) + 5 chat(25) + 10 min(20→15) + PPM(20) + interest(25) = 133 → capped 100
const maxScore = calculateEngagementScore({
  sectionsViewed: ['a','b','c','d','e','f'],
  chatMessages: 5,
  timeSeconds: 600,
  ppmRequested: true,
  interestIndicated: true,
});
test(`Max scenario = ${maxScore} (expected 100, capped)`, maxScore === 100);

// Test: 3 sections(24) + 2 chat(10) + 5 min(10) + no PPM + no interest = 44
const midScore = calculateEngagementScore({
  sectionsViewed: ['a','b','c'],
  chatMessages: 2,
  timeSeconds: 300,
  ppmRequested: false,
  interestIndicated: false,
});
test(`Mid scenario = ${midScore} (expected 44)`, midScore === 44);

// Test: 0 sections + 0 chat + 0 time = 0
const zeroScore = calculateEngagementScore({
  sectionsViewed: [],
  chatMessages: 0,
  timeSeconds: 0,
});
test(`Zero scenario = ${zeroScore} (expected 0)`, zeroScore === 0);

// Test: sections cap at 48 (6×8)
const sevenSections = calculateEngagementScore({
  sectionsViewed: ['a','b','c','d','e','f','g'],
  chatMessages: 0,
  timeSeconds: 0,
});
test(`7 sections = ${sevenSections} (expected 48, capped at 6×8)`, sevenSections === 48);

// Test: chat cap at 25
const manyChat = calculateEngagementScore({
  sectionsViewed: [],
  chatMessages: 10,
  timeSeconds: 0,
});
test(`10 chat msgs = ${manyChat} (expected 25, capped)`, manyChat === 25);

// Test: time cap at 15
const longTime = calculateEngagementScore({
  sectionsViewed: [],
  chatMessages: 0,
  timeSeconds: 3600,
});
test(`60 min time = ${longTime} (expected 15, capped)`, longTime === 15);

// 2. Test investor readiness
console.log('\nInvestor readiness:');

const hotScore = getInvestorReadiness({ score: 85, sectionsViewed: ['a','b'], ppmRequested: false });
test(`Score 85 → "${hotScore}" (expected "hot")`, hotScore === 'hot');

const hotPpm = getInvestorReadiness({ score: 30, sectionsViewed: ['a'], ppmRequested: true });
test(`PPM requested → "${hotPpm}" (expected "hot")`, hotPpm === 'hot');

const warm = getInvestorReadiness({ score: 65, sectionsViewed: ['a','b','c','d'], ppmRequested: false });
test(`Score 65 + 4 sections → "${warm}" (expected "warm")`, warm === 'warm');

const coldLowSections = getInvestorReadiness({ score: 65, sectionsViewed: ['a','b','c'], ppmRequested: false });
test(`Score 65 + 3 sections → "${coldLowSections}" (expected "cold")`, coldLowSections === 'cold');

const cold = getInvestorReadiness({ score: 40, sectionsViewed: ['a','b','c','d','e'], ppmRequested: false });
test(`Score 40 → "${cold}" (expected "cold")`, cold === 'cold');

// 3. HubSpot sync properties
console.log('\nHubSpot integration:');
const hubspotSvc = fs.readFileSync(path.join(__dirname, '../server/src/services/hubspot.js'), 'utf-8');
test('syncEngagement sets gc_deal_room_engagement_score', hubspotSvc.includes('gc_deal_room_engagement_score'));
test('syncEngagement sets gc_deal_room_sections_viewed', hubspotSvc.includes('gc_deal_room_sections_viewed'));
test('syncEngagement sets gc_deal_room_time_spent', hubspotSvc.includes('gc_deal_room_time_spent'));
test('syncEngagement sets gc_deal_room_chat_messages', hubspotSvc.includes('gc_deal_room_chat_messages'));
test('syncEngagement sets gc_deal_room_last_visit', hubspotSvc.includes('gc_deal_room_last_visit'));
test('syncEngagement sets gc_investor_readiness', hubspotSvc.includes('gc_investor_readiness'));

// 4. Heartbeat handler integration
console.log('\nHeartbeat handler:');
const analytics = fs.readFileSync(path.join(__dirname, '../server/src/routes/analytics.js'), 'utf-8');
test('Imports getInvestorReadiness', analytics.includes('getInvestorReadiness'));
test('Imports syncEngagement', analytics.includes('syncEngagement'));
test('Calls calculateEngagementScore with new params', analytics.includes('timeSeconds: elapsed'));
test('Computes readiness tier', analytics.includes('getInvestorReadiness('));
test('Calls syncEngagement with readiness', analytics.includes('readiness'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
