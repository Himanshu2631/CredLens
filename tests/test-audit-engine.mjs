import { runSpendAudit } from '../lib/audit/rulesEngine.js';

console.log('--- START SPEND AUDIT RECOMMENDATION RULES TEST SUITE ---');

// Assert helper
function assertEquals(actual, expected, message) {
  if (actual === expected) {
    console.log(`  ✓ Success: ${message}`);
  } else {
    console.error(`  ✗ Failure: ${message} (Expected: ${expected}, Got: ${actual})`);
    process.exit(1);
  }
}

// ----------------------------------------------------
// Test Case 1: Fixture A (Seed Team of 1 user, redundant editors, ChatGPT Team)
// ----------------------------------------------------
console.log('\n--- Test Case 1: Seed Team (Solo Dev with redundant setup) ---');
const fixtureA = {
  tools: ['cursor', 'copilot', 'chatgpt'],
  toolPlans: {
    cursor: 'business', // $40/mo
    copilot: 'business', // $19/mo
    chatgpt: 'team' // $30/mo, 2 seat min = $60/mo
  },
  seats: 1,
  monthlySpend: 150,
  useCase: 'coding',
  optimizationGoal: 'Reduce redundant tools'
};

const resultA = runSpendAudit(fixtureA);

// Baseline calculations:
// Cursor cost = $40 * 1 = $40
// Copilot cost = $19 * 1 = $19
// ChatGPT Team cost = $30 * 2 min seats = $60
// Subscription subtotal = $40 + $19 + $60 = $119
// Residual API spend = $150 - $119 = $31
assertEquals(resultA.summary.subscriptionCost, 119, 'Subscription cost subtotal should be $119');
assertEquals(resultA.summary.apiSpend, 31, 'Allocated API spend should be $31');

// Recommendations triggered:
// 1. Cursor + Copilot redundancy: savings = $19
// 2. ChatGPT Team 1-seat downgrade: savings = $40
const recA_ids = resultA.recommendations.map(r => r.id);
assertEquals(recA_ids.includes('rule-copilot-cursor-overlap'), true, 'Should trigger Cursor/Copilot overlap rule');
assertEquals(recA_ids.includes('rule-chatgpt-team-min-seat'), true, 'Should trigger ChatGPT Team 1-seat downgrade rule');

const copilotRec = resultA.recommendations.find(r => r.id === 'rule-copilot-cursor-overlap');
assertEquals(copilotRec.estimatedSavings, 19, 'Copilot overlap savings should be $19');
assertEquals(copilotRec.priority, 'high', 'Copilot overlap priority should be high');

const chatgptRec = resultA.recommendations.find(r => r.id === 'rule-chatgpt-team-min-seat');
assertEquals(chatgptRec.estimatedSavings, 40, 'ChatGPT downgrade savings should be $40');
assertEquals(chatgptRec.priority, 'medium', 'ChatGPT downgrade priority should be medium');

assertEquals(resultA.summary.totalPotentialSavings, 59, 'Total potential savings should be $59');
assertEquals(resultA.summary.optimizedMonthlySpend, 91, 'Optimized spend should be $91 ($150 - $59)');


// ----------------------------------------------------
// Test Case 2: Fixture B (Series A Scale, Claude Team min-seat waste, overlap, and high API spend)
// ----------------------------------------------------
console.log('\n--- Test Case 2: Series A Scale (4 seats, Claude Team under-min, high API spend) ---');
const fixtureB = {
  tools: ['claude', 'chatgpt', 'openai_api', 'anthropic_api'],
  toolPlans: {
    claude: 'team', // $30/mo, 5 seat min = $150
    chatgpt: 'plus', // $20/mo * 4 seats = $80
    openai_api: 'pay_as_you_go',
    anthropic_api: 'pay_as_you_go'
  },
  seats: 4,
  monthlySpend: 4000,
  useCase: 'coding',
  optimizationGoal: 'Audit API spend and general chat overlap'
};

const resultB = runSpendAudit(fixtureB);

// Subscription subtotal = Claude Team ($150) + ChatGPT Plus ($80) = $230
// Residual API spend = $4000 - $230 = $3770
// API allocations (useCase coding -> 60% Anthropic, 40% OpenAI):
// Anthropic = $3770 * 0.60 = $2262
// OpenAI = $3770 * 0.40 = $1508
assertEquals(resultB.summary.subscriptionCost, 230, 'Subscription subtotal should be $230');
assertEquals(resultB.summary.apiSpend, 3770, 'Residual API spend should be $3770');
assertEquals(resultB.summary.apiAllocation.anthropic_api, 2262, 'Anthropic API allocation should be $2262');
assertEquals(resultB.summary.apiAllocation.openai_api, 1508, 'OpenAI API allocation should be $1508');

const recB_ids = resultB.recommendations.map(r => r.id);
// Expected triggered rules:
// - rule-general-chat-overlap (Claude + ChatGPT) -> savings: ChatGPT ($80) because ChatGPT is $80 and Claude is $150
// - rule-claude-team-min-seat -> Claude Team with 4 seats ($150) vs 4 Pro seats ($80) -> savings: $70
// - rule-anthropic-prompt-caching -> 40% of $2262 = $905 savings
// - rule-openai-mini-migration -> 35% of $1508 = $528 savings
// - rule-openai-context-pruning -> 15% of $1508 = $226 savings

assertEquals(recB_ids.includes('rule-general-chat-overlap'), true, 'Should trigger General Chat overlap rule');
assertEquals(recB_ids.includes('rule-claude-team-min-seat'), true, 'Should trigger Claude Team min-seat rule');
assertEquals(recB_ids.includes('rule-anthropic-prompt-caching'), true, 'Should trigger Anthropic prompt caching rule');
assertEquals(recB_ids.includes('rule-openai-mini-migration'), true, 'Should trigger OpenAI GPT-4o-mini migration rule');
assertEquals(recB_ids.includes('rule-openai-context-pruning'), true, 'Should trigger OpenAI context pruning rule');

const generalChatRec = resultB.recommendations.find(r => r.id === 'rule-general-chat-overlap');
assertEquals(generalChatRec.estimatedSavings, 80, 'General chat overlap savings should be $80');

const claudeMinSeatRec = resultB.recommendations.find(r => r.id === 'rule-claude-team-min-seat');
assertEquals(claudeMinSeatRec.estimatedSavings, 70, 'Claude min-seat savings should be $70');

const anthropicCacheRec = resultB.recommendations.find(r => r.id === 'rule-anthropic-prompt-caching');
assertEquals(anthropicCacheRec.estimatedSavings, 905, 'Anthropic prompt caching savings should be $905');

const openaiMiniRec = resultB.recommendations.find(r => r.id === 'rule-openai-mini-migration');
assertEquals(openaiMiniRec.estimatedSavings, 528, 'OpenAI mini migration savings should be $528');

const openaiPruneRec = resultB.recommendations.find(r => r.id === 'rule-openai-context-pruning');
assertEquals(openaiPruneRec.estimatedSavings, 226, 'OpenAI context pruning savings should be $226');


// ----------------------------------------------------
// Test Case 3: Fixture C (Oversized Enterprise Tiers for small team of 8 users)
// ----------------------------------------------------
console.log('\n--- Test Case 3: Oversized Enterprise Tiers (8 seats) ---');
const fixtureC = {
  tools: ['chatgpt', 'v0_dev', 'gemini'],
  toolPlans: {
    chatgpt: 'enterprise', // Custom: estimated $60/seat, min 20 seats = $1200
    v0_dev: 'enterprise', // Custom: estimated $50/seat, min 10 seats = $500
    gemini: 'business' // $30/seat * 8 = $240
  },
  seats: 8,
  monthlySpend: 2500,
  useCase: 'mixed_usage'
};

const resultC = runSpendAudit(fixtureC);
const recC_ids = resultC.recommendations.map(r => r.id);

// Expected triggered rules:
// - rule-oversized-enterprise-chatgpt: $1200 vs $30 * 8 = $240 -> savings: $960
// - rule-oversized-enterprise-v0_dev: $500 vs $20 * 8 = $160 -> savings: $340
// - rule-gemini-workspace-licensing: should NOT trigger since seats is 8 (> 2)

assertEquals(recC_ids.includes('rule-oversized-enterprise-chatgpt'), true, 'Should trigger ChatGPT Enterprise downgrade');
assertEquals(recC_ids.includes('rule-oversized-enterprise-v0_dev'), true, 'Should trigger v0.dev Enterprise downgrade');
assertEquals(recC_ids.includes('rule-gemini-workspace-licensing'), false, 'Should NOT trigger Gemini Workspace licensing downgrade for 8 seats');

const chatgptEntRec = resultC.recommendations.find(r => r.id === 'rule-oversized-enterprise-chatgpt');
assertEquals(chatgptEntRec.estimatedSavings, 960, 'ChatGPT Enterprise downgrade savings should be $960');
assertEquals(chatgptEntRec.priority, 'high', 'ChatGPT Enterprise downgrade priority should be high');

const v0EntRec = resultC.recommendations.find(r => r.id === 'rule-oversized-enterprise-v0_dev');
assertEquals(v0EntRec.estimatedSavings, 340, 'v0.dev Enterprise downgrade savings should be $340');

console.log('\n--- TEST SUITE COMPLETE: ALL AUDIT ENGINE TESTS PASSED ---');
process.exit(0);
