#!/usr/bin/env node
/**
 * Chunk A Verification: Chat Persistence
 *
 * Tests:
 * 1. Client chatHistory is no longer accepted (injection risk removed)
 * 2. Server loads history from Supabase / in-memory fallback
 * 3. Messages are saved after each AI response
 * 4. In-memory fallback works when Supabase is unavailable
 */

const fs = require('fs');
const path = require('path');

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ${PASS} ${name}`);
    passed++;
  } else {
    console.log(`  ${FAIL} ${name}`);
    failed++;
  }
}

console.log('\n=== Chunk A: Chat Persistence Verification ===\n');

// 1. Check server chat.js no longer uses client chatHistory
const chatRoute = fs.readFileSync(path.join(__dirname, '../server/src/routes/chat.js'), 'utf-8');

console.log('Server-side chat route:');
test('Does not destructure chatHistory from req.body', !chatRoute.includes('chatHistory') || chatRoute.match(/const\s*\{[^}]*chatHistory[^}]*\}\s*=\s*req\.body/) === null);
test('Has loadChatHistory function', chatRoute.includes('async function loadChatHistory'));
test('Has saveChatMessages function', chatRoute.includes('async function saveChatMessages'));
test('Calls loadChatHistory with sessionId', chatRoute.includes('loadChatHistory(sessionId)'));
test('Calls saveChatMessages after demo response', chatRoute.includes('await saveChatMessages(sessionId, message, parsed.cleanText'));
test('Calls saveChatMessages after streaming response', (chatRoute.match(/saveChatMessages/g) || []).length >= 3);
test('loadChatHistory queries Supabase chat_messages table', chatRoute.includes("from('chat_messages')") && chatRoute.includes("eq('session_id', sessionId)"));
test('loadChatHistory falls back to in-memory Map', chatRoute.includes('chatHistories.get(sessionId)'));
test('saveChatMessages updates in-memory Map', chatRoute.includes("chatHistories.get(sessionId).push"));
test('saveChatMessages persists to Supabase', chatRoute.includes("supabase.from('chat_messages').insert"));
test('Updates chat_message_count on session', chatRoute.includes('chat_message_count'));

// 2. Check client useChat.ts no longer sends chatHistory
console.log('\nClient useChat hook:');
const useChatFile = fs.readFileSync(path.join(__dirname, '../client/src/hooks/useChat.ts'), 'utf-8');
test('Does not send chatHistory in request body', !useChatFile.includes('chatHistory: historyForApi'));
test('Does not build historyForApi', !useChatFile.includes('const historyForApi'));

// 3. Check message ordering
console.log('\nMessage ordering:');
test('History loaded with ascending order', chatRoute.includes("ascending: true"));
test('History trimmed to last 20', chatRoute.includes('history.slice(-20)'));

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
process.exit(failed > 0 ? 1 : 0);
