import { calculatePlanCost, generateAuditAnalysis, getToolPlans } from '../data/pricing.js';

console.log('--- START PRICING DATA TEST SUITE ---');

// Test 1: getToolPlans
console.log('\nTest 1: getToolPlans');
const chatgptPlans = getToolPlans('chatgpt');
if (chatgptPlans.length === 3) {
  console.log('✓ Success: ChatGPT has 3 plans');
} else {
  console.error('✗ Failure: Expected 3 plans, got', chatgptPlans.length);
  process.exit(1);
}

// Test 2: calculatePlanCost for Subscription Per User
console.log('\nTest 2: calculatePlanCost (ChatGPT Plus for 5 seats)');
const plusCost = calculatePlanCost('chatgpt', 'plus', 5);
if (plusCost === 100) {
  console.log('✓ Success: ChatGPT Plus for 5 seats cost is $100');
} else {
  console.error('✗ Failure: Expected $100, got', plusCost);
  process.exit(1);
}

// Test 3: calculatePlanCost for Subscription Per Seat
console.log('\nTest 3: calculatePlanCost (ChatGPT Team for 5 seats)');
const teamCost = calculatePlanCost('chatgpt', 'team', 5);
if (teamCost === 150) {
  console.log('✓ Success: ChatGPT Team for 5 seats cost is $150');
} else {
  console.error('✗ Failure: Expected $150, got', teamCost);
  process.exit(1);
}

// Test 4: calculatePlanCost for API Usage Based
console.log('\nTest 4: calculatePlanCost (OpenAI API usage is flat/0 baseline)');
const apiCost = calculatePlanCost('openai_api', 'pay_as_you_go', 5);
if (apiCost === 0) {
  console.log('✓ Success: OpenAI API baseline is $0');
} else {
  console.error('✗ Failure: Expected $0, got', apiCost);
  process.exit(1);
}

// Test 5: generateAuditAnalysis (Cursor + Copilot Redundancy)
console.log('\nTest 5: generateAuditAnalysis (Cursor + Copilot redundancy check)');
const analysis = generateAuditAnalysis(['cursor', 'copilot'], { cursor: 'business', copilot: 'business' }, 10, 500);
const copilotOverlapRec = analysis.recommendations.find(r => r.id === 'rec-cursor-copilot-overlap');
if (copilotOverlapRec && copilotOverlapRec.savings === 190) {
  console.log('✓ Success: Identified Cursor/Copilot redundancy with $190/mo savings');
} else {
  console.error('✗ Failure: Expected $190 savings, got:', copilotOverlapRec ? copilotOverlapRec.savings : 'no recommendation');
  process.exit(1);
}

// Test 6: generateAuditAnalysis (Governance migration for team sizes)
console.log('\nTest 6: generateAuditAnalysis (ChatGPT Team migration warning for seats >= 5)');
const teamAnalysis = generateAuditAnalysis(['chatgpt'], { chatgpt: 'plus' }, 8, 160);
const migrateRec = teamAnalysis.recommendations.find(r => r.id === 'rec-chatgpt-migrate-team');
if (migrateRec && migrateRec.savings === 0) {
  console.log('✓ Success: Identified ChatGPT Plus -> Team migration hint');
} else {
  console.error('✗ Failure: Expected governance recommendation, got:', migrateRec);
  process.exit(1);
}

console.log('\n--- TEST SUITE COMPLETE: ALL TESTS PASSED ---');
process.exit(0);
