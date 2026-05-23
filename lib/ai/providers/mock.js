import { BaseProvider } from './base.js';

/**
 * High-fidelity Fallback/Mock AI Summary Generator.
 * Constructs financially sound summaries and insights using the actual audit results.
 */
export function generateMockSummary(auditData) {
  const {
    projectName,
    seats,
    summary = {},
    recommendations = []
  } = auditData || {};

  const safeSummary = summary || {};
  const recs = Array.isArray(recommendations) ? recommendations : [];

  const hasSavings = safeSummary.totalEstimatedSavings > 0;
  const formattedSavings = safeSummary.formattedEstimatedSavings || `$${safeSummary.totalEstimatedSavings || 0}/mo`;
  const formattedOptimized = safeSummary.formattedOptimizedSpend || `$${safeSummary.optimizedSpendEstimate || 0}/mo`;
  const formattedYearly = safeSummary.formattedEstimatedYearlySavings || `$${(safeSummary.totalEstimatedSavings || 0) * 12}/yr`;
  const formattedCurrent = safeSummary.formattedCurrentSpend || `$${safeSummary.totalCurrentSpend || 0}/mo`;

  if (!hasSavings) {
    return {
      executiveSummary: `An audit of the ${projectName || 'Startup'} AI stack confirms that your current subscription licenses and API configurations are fully optimized. Your active monthly baseline of ${formattedCurrent} matches your calculated target spend.`,
      keyInsights: [
        `Zero license redundancies detected across your ${seats} active seat footprint.`,
        "Subscription tiers align perfectly with your team size and operational use cases.",
        "Volumetric API configurations are optimized with no token wastage or caching gaps detected."
      ],
      runwayImpact: "Your current AI deployment represents a lean, highly efficient baseline with zero wasted operating capital.",
      provider: "mock",
      generatedAt: new Date()
    };
  }

  // Build specific insights from triggered recommendations
  const insights = [];
  
  // Try to generate insights from recommendations
  recs.forEach(rec => {
    if (insights.length >= 3) return;
    
    const toolName = rec.provider ? rec.provider.charAt(0).toUpperCase() + rec.provider.slice(1) : 'SaaS';
    if (rec.id.includes('overlap') || rec.id.includes('redundancy')) {
      insights.push(`Consolidating duplicate ${toolName} assistant seats saves ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}.`);
    } else if (rec.id.includes('min-seat')) {
      insights.push(`Downgrading from Team tiers to individual plans maps seats to actual usage and saves ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}.`);
    } else if (rec.id.includes('caching')) {
      insights.push(`Implementing prompt caching headers for repetitive instructions cuts volumetric API fees by ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}.`);
    } else if (rec.id.includes('mini')) {
      insights.push(`Routing low-complexity classification tasks to lighter models like ${toolName} mini trims costs by ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}.`);
    } else if (rec.id.includes('unused')) {
      insights.push(`Pruning inactive ghost seats across subscriptions recovers ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}.`);
    }
  });

  // Fallbacks if recommendations did not cover exactly 3 insights
  const fallbacks = [
    `Reclaiming underutilized seat licenses across team workspaces is the fastest path to reducing spend.`,
    `Optimizing API context windows and pruning conversation history limits recurring input token costs.`,
    `Consolidating SaaS subscriptions under unified team billings controls unexpected operating overhead.`
  ];

  while (insights.length < 3) {
    const nextFallback = fallbacks.find(fb => !insights.includes(fb)) || fallbacks[0];
    insights.push(nextFallback);
  }

  // Ensure it's exactly 3
  const keyInsights = insights.slice(0, 3);

  const execSummary = `Our financial audit identified ${formattedSavings} in monthly optimization opportunities across the ${projectName || 'Startup'} AI stack. Addressing these redundancies decreases your recurring baseline from ${formattedCurrent} to ${formattedOptimized}, reclaiming ${safeSummary.runwayRestoredPercent || 0}% of active AI operating overhead.`;

  const runwayImpact = `Securing ${formattedYearly} in annualized runway extends operating cash flow and provides capital that can be redirected to core engineering or product growth.`;

  return {
    executiveSummary: execSummary,
    keyInsights,
    runwayImpact,
    provider: "mock",
    generatedAt: new Date()
  };
}

/**
 * Mock/Fallback Provider Strategy.
 */
export class MockProvider extends BaseProvider {
  constructor() {
    super('mock');
  }

  async generateSummary(apiKey, auditData, userPrompt) {
    console.log('[Mock Provider] Generating offline high-fidelity local summary...');
    const summary = generateMockSummary(auditData);
    return {
      ...summary,
      provider: 'mock',
      generatedAt: new Date()
    };
  }
}
