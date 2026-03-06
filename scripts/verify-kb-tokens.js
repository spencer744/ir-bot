// Run: node scripts/verify-kb-tokens.js
// Outputs: token count per file, per category, and total

const path = require('path');

// Adjust module path for running from project root
const kbSelectorPath = path.join(__dirname, '../server/src/services/kbSelector');
const { getKBInventory } = require(kbSelectorPath);

const inventory = getKBInventory();

console.log('\n=== Gray Capital Knowledge Base — Token Audit ===\n');

const byCategory = {};
for (const file of inventory) {
  if (!byCategory[file.category]) byCategory[file.category] = [];
  byCategory[file.category].push(file);
}

for (const [cat, files] of Object.entries(byCategory)) {
  const catTokens = files.reduce((sum, f) => sum + f.estimated_tokens, 0);
  console.log(`\n${cat.toUpperCase()} (${files.length} files, ~${catTokens} tokens):`);
  for (const f of files) {
    const warning = f.estimated_tokens > 2000 ? ' ⚠️  OVER 2K' : '';
    console.log(`  ${f.path.padEnd(55)} ~${String(f.estimated_tokens).padStart(5)} tokens${warning}`);
  }
}

const totalTokens = inventory.reduce((sum, f) => sum + f.estimated_tokens, 0);
console.log(`\n${'='.repeat(65)}`);
console.log(`TOTAL: ${inventory.length} files, ~${totalTokens} tokens`);
console.log(`Average per file: ~${Math.round(totalTokens / inventory.length)} tokens`);

// Warn if any single request could exceed budget
console.log(`\nMax possible load (all files): ~${totalTokens} tokens`);
console.log(`Per-request budget: ~15,000 tokens`);
console.log(`Budget status: ${totalTokens > 15000 ? '✓ Selective loading required (working as designed)' : '✓ All files fit in budget'}`);

// Check for oversized files
const oversized = inventory.filter(f => f.estimated_tokens > 2500);
if (oversized.length > 0) {
  console.log(`\n⚠️  FILES EXCEEDING 2,500 TOKENS (consider splitting):`);
  for (const f of oversized) {
    console.log(`  ${f.path} — ~${f.estimated_tokens} tokens`);
  }
} else {
  console.log(`\n✓ No files exceed 2,500 token limit`);
}
