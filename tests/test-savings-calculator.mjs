import { 
  sanitizeAuditInputs,
  calculateSubscriptionBaseline,
  buildSavingsResult,
  calculatePlanDowngradeSavings,
  calculateRedundantToolSavings,
  calculateApiStrategySavings 
} from '../lib/audit/savingsCalculator.js';

console.log('--- START SAVINGS CALCULATOR UNIT TEST SUITE ---');

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
// 1. Sanitization boundary edge case tests
// ----------------------------------------------------
console.log('\n--- 1. Sanitization Boundary Tests ---');

// Null/empty input
const emptySanitized = sanitizeAuditInputs(null);
assertEquals(emptySanitized.tools.length, 0, 'Empty input should yield empty tools array');
assertEquals(emptySanitized.seats, 1, 'Empty input should yield default 1 seat');
assertEquals(emptySanitized.monthlySpend, 0, 'Empty input should yield default $0 spend');
assertEquals(emptySanitized.useCase, 'mixed_usage', 'Empty input should yield default mixed_usage useCase');

// Invalid/negative seats
const badSeats = sanitizeAuditInputs({ seats: -10 });
assertEquals(badSeats.seats, 1, 'Negative seats should default to 1');
const stringSeats = sanitizeAuditInputs({ seats: 'abc' });
assertEquals(stringSeats.seats, 1, 'Non-number seats should default to 1');
const decimalSeats = sanitizeAuditInputs({ seats: 4.8 });
assertEquals(decimalSeats.seats, 4, 'Decimal seats should be truncated to whole integer');

// Invalid/negative monthlySpend
const badSpend = sanitizeAuditInputs({ monthlySpend: -250 });
assertEquals(badSpend.monthlySpend, 0, 'Negative spend should default to $0');
const stringSpend = sanitizeAuditInputs({ monthlySpend: '1500.50' });
assertEquals(stringSpend.monthlySpend, 1500.50, 'String decimal spend should be parsed correctly');

// Invalid plan mappings (should default to first plan in registry)
const badPlan = sanitizeAuditInputs({
  tools: ['chatgpt'],
  toolPlans: { chatgpt: 'non_existent_plan_id' }
});
assertEquals(badPlan.toolPlans.chatgpt, 'plus', 'Invalid plan ID should default to plus tier');


// ----------------------------------------------------
// 2. Subscription Baseline Calculations
// ----------------------------------------------------
console.log('\n--- 2. Subscription Baseline Tests ---');

// Claude Team minimum seat constraint: 5 seats minimum
const claudeTeamBaseline = calculateSubscriptionBaseline(['claude'], { claude: 'team' }, 2);
assertEquals(claudeTeamBaseline, 150, 'Claude Team baseline cost for 2 users should be $150 (5 seats min)');

const claudeTeamBaseline6 = calculateSubscriptionBaseline(['claude'], { claude: 'team' }, 6);
assertEquals(claudeTeamBaseline6, 180, 'Claude Team baseline cost for 6 users should be $180 ($30 * 6)');

// Flat rates vs per user rates
const mixedBaseline = calculateSubscriptionBaseline(
  ['chatgpt', 'copilot'],
  { chatgpt: 'plus', copilot: 'individual' },
  4
);
// ChatGPT Plus ($20 flat rate, wait! pricing.js has seatPricing: false, pricingType: 'per_user', cost: 20 * 4 = 80)
// Copilot Individual ($10 flat rate, pricingType: 'per_user', cost: 10 * 4 = 40)
// Subtotal = 80 + 40 = 120
assertEquals(mixedBaseline, 120, 'Baseline cost for ChatGPT Plus and Copilot Individual for 4 users should be $120');


// ----------------------------------------------------
// 3. Savings result formatting & bounds
// ----------------------------------------------------
console.log('\n--- 3. Savings Result Formatting Tests ---');

const normalResult = buildSavingsResult(100, 70, 'Save $30');
assertEquals(normalResult.currentMonthlyCost, 100, 'Current cost should be 100');
assertEquals(normalResult.optimizedMonthlyCost, 70, 'Optimized cost should be 70');
assertEquals(normalResult.estimatedMonthlySavings, 30, 'Monthly savings should be 30');
assertEquals(normalResult.estimatedYearlySavings, 360, 'Yearly savings should be 360');

// Optimized cost higher than current (should clamp savings to 0)
const badOptimizedResult = buildSavingsResult(100, 120, 'Negative savings');
assertEquals(badOptimizedResult.optimizedMonthlyCost, 100, 'Optimized cost should be clamped to current cost');
assertEquals(badOptimizedResult.estimatedMonthlySavings, 0, 'Monthly savings should clamp to 0');
assertEquals(badOptimizedResult.estimatedYearlySavings, 0, 'Yearly savings should clamp to 0');

// Negative current cost (should clamp to 0)
const negativeCurrent = buildSavingsResult(-50, -20, 'Negative inputs');
assertEquals(negativeCurrent.currentMonthlyCost, 0, 'Current cost should clamp to 0');
assertEquals(negativeCurrent.optimizedMonthlyCost, 0, 'Optimized cost should clamp to 0');
assertEquals(negativeCurrent.estimatedMonthlySavings, 0, 'Savings should clamp to 0');


// ----------------------------------------------------
// 4. API Optimization Strategy equations
// ----------------------------------------------------
console.log('\n--- 4. API Strategy Tests ---');

// Prompt Caching (40% savings)
const cachingSavings = calculateApiStrategySavings(1000, 'prompt_caching', 'Claude');
assertEquals(cachingSavings.estimatedMonthlySavings, 400, 'Prompt caching savings should be 40% ($400)');
assertEquals(cachingSavings.optimizedMonthlyCost, 600, 'Optimized spend for prompt caching should be $600');
assertEquals(cachingSavings.estimatedYearlySavings, 4800, 'Yearly caching savings should be $4800');

// Mini Migration (35% savings)
const miniSavings = calculateApiStrategySavings(1000, 'mini_migration', 'OpenAI');
assertEquals(miniSavings.estimatedMonthlySavings, 350, 'Mini model migration savings should be 35% ($350)');
assertEquals(miniSavings.optimizedMonthlyCost, 650, 'Optimized spend for mini migration should be $650');

// Context Pruning (15% savings)
const pruningSavings = calculateApiStrategySavings(1000, 'context_pruning', 'OpenAI');
assertEquals(pruningSavings.estimatedMonthlySavings, 150, 'Context pruning savings should be 15% ($150)');
assertEquals(pruningSavings.optimizedMonthlyCost, 850, 'Optimized spend for context pruning should be $850');

// Zero spend boundary case
const zeroApiSpend = calculateApiStrategySavings(0, 'prompt_caching', 'Claude');
assertEquals(zeroApiSpend.estimatedMonthlySavings, 0, 'Zero API spend should yield $0 savings');

console.log('\n--- TEST SUITE COMPLETE: ALL SAVINGS CALCULATOR TESTS PASSED ---');
process.exit(0);
