#!/usr/bin/env node
/**
 * Chunk B Verification: Return Visitor AI Experience
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

console.log('\n=== Chunk B: Return Visitor AI Experience ===\n');

// Server auth route
const authRoute = fs.readFileSync(path.join(__dirname, '../server/src/routes/auth.js'), 'utf-8');
console.log('Auth verify route:');
test('Detects returning investor via prior sessions count', authRoute.includes('sessions.length > 1'));
test('Sets is_returning flag', authRoute.includes('is_returning = true'));
test('Collects last_sections_visited from prior sessions', authRoute.includes('last_sections_visited'));
test('Returns is_returning in response', authRoute.includes("is_returning,") || authRoute.includes("is_returning:"));
test('Returns last_sections_visited in response', authRoute.includes("last_sections_visited,") || authRoute.includes("last_sections_visited:"));

// System prompt service
console.log('\nSystem prompt service:');
const sysPrompt = fs.readFileSync(path.join(__dirname, '../server/src/services/systemPrompt.js'), 'utf-8');
test('Exports buildSystemPrompt function', sysPrompt.includes('function buildSystemPrompt'));
test('Handles is_returning flag', sysPrompt.includes('is_returning'));
test('Uses first_name in greeting', sysPrompt.includes('first_name'));
test('Maps section IDs to labels', sysPrompt.includes('sectionLabels'));
test('Adds returning visitor context to prompt', sysPrompt.includes('RETURNING VISITOR CONTEXT'));
test('Returns plain SYSTEM_PROMPT for non-returning visitors', sysPrompt.includes('return SYSTEM_PROMPT'));

// Chat route uses buildSystemPrompt
console.log('\nChat route integration:');
const chatRoute = fs.readFileSync(path.join(__dirname, '../server/src/routes/chat.js'), 'utf-8');
test('Imports buildSystemPrompt', chatRoute.includes("require('../services/systemPrompt')"));
test('Calls buildSystemPrompt with session data', chatRoute.includes('buildSystemPrompt('));
test('Passes isReturning from session', chatRoute.includes('session.isReturning'));
test('Passes lastSectionsVisited from session', chatRoute.includes('session.lastSectionsVisited'));

// Client DealContext
console.log('\nClient DealContext:');
const dealCtx = fs.readFileSync(path.join(__dirname, '../client/src/context/DealContext.tsx'), 'utf-8');
test('Stores isReturning state', dealCtx.includes('isReturning'));
test('Stores lastSectionsVisited state', dealCtx.includes('lastSectionsVisited'));
test('Sets isReturning from verify response', dealCtx.includes('setIsReturning(true)'));

// Client useChat
console.log('\nClient useChat:');
const useChat = fs.readFileSync(path.join(__dirname, '../client/src/hooks/useChat.ts'), 'utf-8');
test('Passes isReturning in session payload', useChat.includes('isReturning:'));
test('Passes lastSectionsVisited in session payload', useChat.includes('lastSectionsVisited:'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
