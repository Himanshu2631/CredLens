/**
 * Test suite for the AI Audit Summary Generation System.
 */

import { extractJSON, validateAndRepairSummary, generateAuditSummary } from '../lib/ai/aiService.js';
import { generateMockSummary } from '../lib/ai/providers/mock.js';
import { buildUserPrompt } from '../lib/ai/prompts.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ Success: ${message}`);
  } else {
    console.error(`  ✗ Fail: ${message}`);
    process.exitCode = 1;
  }
}

console.log('--- START AI SUMMARY SYSTEM TESTS ---');

// --- 1. JSON Extraction Tests ---
try {
  console.log('\n--- 1. JSON Extraction Tests ---');
  
  // Direct JSON
  const rawJson = '{"executiveSummary": "test summary", "keyInsights": ["i1"], "runwayImpact": "ri1"}';
  const p1 = extractJSON(rawJson);
  assert(p1.executiveSummary === 'test summary', 'Should parse clean direct JSON');
  assert(p1.keyInsights[0] === 'i1', 'Should preserve insight lists in direct JSON');

  // Markdown code fence JSON
  const mdJson = `Here is your JSON response:
\`\`\`json
{
  "executiveSummary": "markdown summary",
  "keyInsights": ["i2"],
  "runwayImpact": "ri2"
}
\`\`\`
Hope this helps!`;
  const p2 = extractJSON(mdJson);
  assert(p2.executiveSummary === 'markdown summary', 'Should parse JSON wrapped in markdown fences');
  assert(p2.keyInsights[0] === 'i2', 'Should extract nested insights from markdown blocks');

  // Curly brace boundary substring extraction
  const textJson = `Sure, here is the structured object:
{
  "executiveSummary": "curly summary",
  "keyInsights": ["i3"],
  "runwayImpact": "ri3"
}`;
  const p3 = extractJSON(textJson);
  assert(p3.executiveSummary === 'curly summary', 'Should extract JSON from surrounding explanation text');
  
} catch (e) {
  console.error('JSON Extraction Tests crashed:', e);
  process.exitCode = 1;
}

// --- 2. Validation & Repair Tests ---
try {
  console.log('\n--- 2. Validation & Repair Tests ---');

  const fallbackData = {
    executiveSummary: 'fallback summary',
    keyInsights: ['f1', 'f2', 'f3'],
    runwayImpact: 'fallback runway'
  };

  // Missing insights array should get backfilled
  const invalidPayload = {
    executiveSummary: 'custom summary',
    keyInsights: null,
    runwayImpact: 'custom runway'
  };
  const repaired1 = validateAndRepairSummary(invalidPayload, fallbackData);
  assert(repaired1.executiveSummary === 'custom summary', 'Should preserve valid keys');
  assert(Array.isArray(repaired1.keyInsights) && repaired1.keyInsights.length === 3, 'Should repair and backfill keyInsights list to length 3');
  assert(repaired1.keyInsights[0] === 'f1', 'Should use fallback insights to fill blanks');

  // Partially filled insights should get padded to length 3
  const partialPayload = {
    executiveSummary: 'custom summary 2',
    keyInsights: ['c1'],
    runwayImpact: 'custom runway 2'
  };
  const repaired2 = validateAndRepairSummary(partialPayload, fallbackData);
  assert(repaired2.keyInsights.length === 3, 'Should pad keyInsights to exactly 3 insights');
  assert(repaired2.keyInsights[0] === 'c1', 'Should preserve original insights');
  assert(repaired2.keyInsights[1] === 'f2', 'Should backfill secondary fields from fallback');
  
} catch (e) {
  console.error('Validation & Repair Tests crashed:', e);
  process.exitCode = 1;
}

// --- 3. Mock Template Generator Tests ---
try {
  console.log('\n--- 3. Mock Template Generator Tests ---');

  const auditDataMock = {
    projectName: 'Acme Corp',
    seats: 5,
    summary: {
      totalCurrentSpend: 1000,
      optimizedSpendEstimate: 700,
      totalEstimatedSavings: 300,
      totalEstimatedYearlySavings: 3600,
      runwayRestoredPercent: 30,
      formattedCurrentSpend: '$1,000/mo',
      formattedOptimizedSpend: '$700/mo',
      formattedEstimatedSavings: '$300/mo',
      formattedEstimatedYearlySavings: '$3,600/yr',
      subscriptionCost: 600,
      apiSpend: 400
    },
    recommendations: [
      {
        id: 'rule-copilot-cursor-overlap',
        provider: 'github',
        category: 'redundancy',
        title: 'Consolidate Code Assistant Seats',
        explanation: 'Deactivate GitHub Copilot licenses.',
        whyItMatters: 'Cursor contains its own autocomplete.',
        priority: 'high',
        estimatedImpact: 'High',
        estimatedSavings: { formattedMonthly: '$190/mo' },
        estimatedMonthlySavings: 190,
        estimatedYearlySavings: 2280
      }
    ]
  };

  const mockResult = generateMockSummary(auditDataMock);
  assert(mockResult.executiveSummary.includes('Acme Corp'), 'Mock executive summary should contain the project name');
  assert(mockResult.executiveSummary.includes('$300/mo'), 'Mock summary should reference actual savings');
  assert(mockResult.keyInsights.length === 3, 'Mock summary must contain exactly 3 key insights');
  assert(mockResult.keyInsights[0].includes('Consolidating duplicate Github assistant seats'), 'Mock should generate specific insights from recommendation list');

  // Edge case: Zero savings
  const zeroSavingsData = {
    projectName: 'Optimal Startup',
    seats: 2,
    summary: {
      totalCurrentSpend: 200,
      optimizedSpendEstimate: 200,
      totalEstimatedSavings: 0,
      formattedCurrentSpend: '$200/mo',
      formattedOptimizedSpend: '$200/mo',
      formattedEstimatedSavings: '$0/mo',
      runwayRestoredPercent: 0
    },
    recommendations: []
  };

  const zeroResult = generateMockSummary(zeroSavingsData);
  assert(zeroResult.executiveSummary.includes('fully optimized'), 'Zero savings summary should acknowledge optimization is complete');
  assert(zeroResult.keyInsights[0].includes('Zero license redundancies'), 'Zero savings should return clean generic stack insights');
  
} catch (e) {
  console.error('Mock Template Generator Tests crashed:', e);
  process.exitCode = 1;
}

// --- 4. User Prompt Builder Tests ---
try {
  console.log('\n--- 4. User Prompt Builder Tests ---');

  const auditDataForPrompt = {
    projectName: 'Beta Inc',
    seats: 3,
    useCase: 'Software Development',
    optimizationGoal: 'Reduce subscription costs',
    summary: {
      totalCurrentSpend: 500,
      optimizedSpendEstimate: 400,
      totalEstimatedSavings: 100,
      runwayRestoredPercent: 20,
      subscriptionCost: 300,
      apiSpend: 200
    },
    recommendations: []
  };

  const promptText = buildUserPrompt(auditDataForPrompt);
  assert(promptText.includes('Beta Inc'), 'Prompt should include project/startup context');
  assert(promptText.includes('Software Development'), 'Prompt should inject useCase details');
  assert(promptText.includes('Baseline Subscriptions: $300/mo'), 'Prompt should include actual subscription calculations');
  
} catch (e) {
  console.error('User Prompt Builder Tests crashed:', e);
  process.exitCode = 1;
}

// --- 5. AI Service Orchestrator Routing Tests ---
try {
  console.log('\n--- 5. AI Service Orchestrator Routing Tests ---');

  process.env.AI_PROVIDER = 'gemini';
  process.env.GEMINI_API_KEY = ''; // Empty key to trigger fallback

  const auditDataForOrchestrator = {
    projectName: 'Acme LLC',
    seats: 4,
    summary: {
      totalCurrentSpend: 800,
      optimizedSpendEstimate: 600,
      totalEstimatedSavings: 200,
      runwayRestoredPercent: 25
    },
    recommendations: []
  };

  const summaryResult = await generateAuditSummary(auditDataForOrchestrator);
  assert(summaryResult.provider === 'mock', 'Should gracefully fall back to mock builder when GEMINI_API_KEY is missing');
  assert(summaryResult.executiveSummary.includes('Acme LLC'), 'Fallback summary should still contain calculation details');

} catch (e) {
  console.error('AI Service Orchestrator Routing Tests crashed:', e);
  process.exitCode = 1;
}

console.log(`\n--- TEST SUITE COMPLETE: ${passedTests}/${totalTests} TESTS PASSED ---`);
