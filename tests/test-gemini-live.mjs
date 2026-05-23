import fs from 'fs';
import path from 'path';

// 1. Manually parse env file
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFileContent = fs.readFileSync(envPath, 'utf8');
    envFileContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          process.env[key] = value;
        }
      }
    });
    console.log('✓ Success: Loaded .env.local');
  } else {
    console.log('⚠ Warning: .env.local not found.');
  }
} catch (e) {
  console.error('✗ Failure loading env:', e);
}

// Override to gemini
process.env.AI_PROVIDER = 'gemini';

console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
if (process.env.GEMINI_API_KEY) {
  const key = process.env.GEMINI_API_KEY;
  console.log('GEMINI_API_KEY preview:', key.substring(0, 8) + '...' + key.substring(key.length - 4));
}

import { generateAuditSummary } from '../lib/ai/aiService.js';

const mockAuditData = {
  projectName: 'Live Gemini Test Startup',
  seats: 5,
  useCase: 'Software Development & API Integration',
  optimizationGoal: 'Reduce redundant AI tools and optimize API caching',
  summary: {
    totalCurrentSpend: 1500,
    optimizedSpendEstimate: 950,
    totalEstimatedSavings: 550,
    totalEstimatedYearlySavings: 6600,
    runwayRestoredPercent: 20,
    formattedCurrentSpend: '$1,500/mo',
    formattedOptimizedSpend: '$950/mo',
    formattedEstimatedSavings: '$550/mo',
    formattedEstimatedYearlySavings: '$6,600/yr',
    subscriptionCost: 800,
    apiSpend: 700
  },
  recommendations: [
    {
      id: 'rule-copilot-cursor-overlap',
      provider: 'github',
      category: 'redundancy',
      title: 'Consolidate Code Assistant Seats',
      explanation: 'Deactivate GitHub Copilot licenses since the team is moving to Cursor.',
      whyItMatters: 'Cursor contains its own autocomplete, making Copilot redundant.',
      priority: 'high',
      estimatedImpact: 'High',
      estimatedSavings: { formattedMonthly: '$100/mo' },
      estimatedMonthlySavings: 100,
      estimatedYearlySavings: 1200
    },
    {
      id: 'rule-anthropic-prompt-caching',
      provider: 'anthropic',
      category: 'underutilization',
      title: 'Implement Anthropic Prompt Caching',
      explanation: 'Enable prompt caching for repetitive system messages and contexts.',
      whyItMatters: 'Cuts API request costs up to 50% for high-context flows.',
      priority: 'high',
      estimatedImpact: 'High',
      estimatedSavings: { formattedMonthly: '$450/mo' },
      estimatedMonthlySavings: 450,
      estimatedYearlySavings: 5400
    }
  ]
};

console.log('\nGenerating live audit summary using Gemini API...');
try {
  const result = await generateAuditSummary(mockAuditData);
  console.log('\n--- Gemini Response Result ---');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.provider === 'gemini') {
    console.log('\n✓ SUCCESS: Gemini API responded and generated summary successfully!');
  } else {
    console.error('\n✗ FAILURE: Summary provider is mock instead of gemini. The request must have fallen back.');
  }
} catch (error) {
  console.error('\n✗ Error during Gemini generation:', error);
}
