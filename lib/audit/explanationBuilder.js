/**
 * Centralized Explanation and Recommendation Presentation Builder
 * 
 * decouples user-facing explanations, impact labels, financial justifications, 
 * and actionable steps from the raw evaluation math of the rules engine.
 */

/**
 * Formats a numeric USD value into a clean currency string.
 * Supports standard localization and optional period suffix.
 * 
 * @param {number} amount 
 * @param {string} period e.g. 'mo', 'yr'
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, period = '') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return period ? `$0/${period}` : '$0';
  }
  const rounded = Math.round(amount);
  const formatted = `$${rounded.toLocaleString('en-US')}`;
  return period ? `${formatted}/${period}` : formatted;
}

/**
 * Maps a lowercase priority string to the capitalized impact level expected by the UI.
 * 
 * @param {string} priority 'high' | 'medium' | 'low'
 * @returns {string} 'High' | 'Medium' | 'Low'
 */
export function getImpactLabel(priority) {
  const mapping = {
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };
  return mapping[priority?.toLowerCase()] || 'Low';
}

/**
 * Library of recommendation copy templates, indexed by rule id or archetype.
 */
const RECOMMENDATION_TEMPLATES = {
  'rule-copilot-cursor-overlap': {
    title: 'Consolidate Code Assistant Seats',
    explanation: 'Deactivate GitHub Copilot licenses for team members already using Cursor.',
    whyItMatters: 'Cursor contains its own autocompletion engine and codebase indexer. Running GitHub Copilot alongside it creates direct feature overlap, wasting subscription fees with zero added developer productivity.',
    actionableSteps: (ctx) => [
      'Audit developer IDE setups to verify Cursor is adopted as the primary standard.',
      `Deactivate GitHub Copilot (${ctx.planName || 'Business'}) seats inside the GitHub organization billing console.`,
      'Ensure Cursor is configured to use its native tab-completion and model access instead.'
    ]
  },
  'rule-general-chat-overlap': {
    title: 'Standardize Team Chat Assistants',
    explanation: 'Unify the team on a single premium chat assistant to avoid license redundancies.',
    whyItMatters: 'Paying for multiple general-purpose chat workspaces (like Claude and ChatGPT simultaneously) splits team workflows and leads to duplicate license overhead. Consolidating on one workspace saves costs and centralizes prompt sharing.',
    actionableSteps: (ctx) => [
      `Survey team members to identify whether ${ctx.choices || 'ChatGPT or Claude'} is the preferred workspace tool.`,
      `Cancel active seats on the secondary assistant platform(s): ${ctx.redundantTools || 'secondary tools'}.`,
      `Transition shared prompts, projects, and workspaces onto the chosen primary assistant.`
    ]
  },
  'rule-chatgpt-team-min-seat': {
    title: 'Downgrade ChatGPT Team to Plus',
    explanation: 'Downgrade ChatGPT Team to an individual Plus plan for a single user.',
    whyItMatters: 'ChatGPT Team enforces a minimum charge for 2 user seats ($60/mo). If you only have 1 active user, you are paying a $30/mo premium for an empty seat. Downgrading to ChatGPT Plus keeps matching model access while halving the price.',
    actionableSteps: () => [
      'Navigate to the ChatGPT Admin panel -> Settings -> Billing.',
      'Cancel the Team workspace subscription.',
      'Sign up for an individual ChatGPT Plus license using the same email account.'
    ]
  },
  'rule-claude-team-min-seat': {
    title: 'Downgrade Claude Team to Claude Pro',
    explanation: 'Transition the Claude Team workspace to individual Claude Pro plans.',
    whyItMatters: 'Claude Team billing enforces a 5-seat minimum ($150/mo). For smaller teams of less than 5 users, you pay for empty seats. Subscribing to individual Claude Pro licenses ($20/mo each) keeps access identical and matches your actual headcount.',
    actionableSteps: (ctx) => [
      'Log in to the Claude.ai team management console.',
      'Export any shared projects or project documents, then cancel the Team subscription.',
      `Have the ${ctx.seatsCount || 'active'} team members register individual Claude Pro seats ($20/mo per user).`
    ]
  },
  'rule-oversized-enterprise': {
    title: 'Downgrade [Tool] Enterprise Plan',
    explanation: 'Transition from an Enterprise agreement to a self-serve Team plan.',
    whyItMatters: 'Enterprise contracts enforce large minimum user commitments and premium seat pricing. For small teams, these administrative features rarely justify paying double or triple the self-serve seat rates.',
    actionableSteps: (ctx) => [
      `Contact the ${ctx.toolName || 'provider'} account executive to cancel the Enterprise agreement.`,
      `Migrate user seats to the self-serve ${ctx.targetPlanName || 'Team'} plan (billed at $${ctx.targetRate || '30'}/seat/mo).`,
      'Configure billing settings to use corporate credit card invoicing.'
    ]
  },
  'rule-gemini-workspace-licensing': {
    title: 'Optimize Gemini Workspace Licensing',
    explanation: 'Downgrade Gemini Business licenses to individual Gemini Advanced plans.',
    whyItMatters: 'Gemini Business adds workspace-wide administrative overhead for $30/seat/mo. For solo developers or micro-teams (<= 2 seats), subscribing to Gemini Advanced (via Google One) offers equivalent model features for 33% less cost.',
    actionableSteps: (ctx) => [
      'Log in to the Google Workspace Admin console.',
      'Navigate to Billing -> Subscriptions and cancel Gemini Business licenses.',
      `Instruct the ${ctx.seatsCount || 'active'} user(s) to subscribe to Google One AI Premium ($19.99/mo) individually if Workspace administration is not critical.`
    ]
  },
  'rule-anthropic-prompt-caching': {
    title: 'Implement Claude Prompt Caching',
    explanation: 'Leverage Anthropic\'s prompt caching headers for recurrent API instructions.',
    whyItMatters: 'For API workloads with repetitive instructions, static system instructions, or large documents (>1024 tokens), Claude prompt caching reduces input token fees by up to 90% and improves response latency.',
    actionableSteps: () => [
      'Add the header "anthropic-beta: prompt-caching-2024-07-31" to API client configurations.',
      'Structure payload arrays so static elements (system messages, tools) are placed first.',
      'Add {"type": "ephemeral"} to the cache_control parameters for system prompts.'
    ]
  },
  'rule-openai-mini-migration': {
    title: 'Route Workloads to GPT-4o-mini',
    explanation: 'Migrate low-complexity API calls from GPT-4o to GPT-4o-mini.',
    whyItMatters: 'Running classification, parsing, or formatting tasks on GPT-4o is expensive. GPT-4o-mini is 80% cheaper and significantly faster, delivering comparable accuracy for non-reasoning tasks.',
    actionableSteps: () => [
      'Audit API logs to identify endpoints running low-complexity tasks (parsing, metadata tagging).',
      'Modify endpoint request configurations, changing model parameter from "gpt-4o" to "gpt-4o-mini".',
      'Validate output quality on mini and enjoy faster response latency.'
    ]
  },
  'rule-openai-context-pruning': {
    title: 'Prune OpenAI Context Windows',
    explanation: 'Trim static system prompts and compress message histories on API requests.',
    whyItMatters: 'Large system prompts and long chat histories increase input token costs exponentially on every generation request. Minifying system prompts and summarizing chat histories can save an average of 15% on API volume.',
    actionableSteps: () => [
      'Minify static system instructions (remove unnecessary spaces, guidelines, and markdown tags).',
      'Implement message context compression (e.g. summarize older conversation logs rather than sending raw histories).',
      'Set explicit max_tokens parameters on completion endpoints.'
    ]
  },
  'rule-unused-seats': {
    title: 'Prune Inactive Member Seats',
    explanation: 'Audit and reclaim unused subscription seats across tools.',
    whyItMatters: 'Buying seats based on hiring projections or adding users who rarely log in leads to "ghost licenses." Auditing and removing inactive seats directly lowers monthly software overhead with zero impact on workflow capacity.',
    actionableSteps: (ctx) => [
      `Audit the seat registry for ${ctx.toolName || 'your subscriptions'} to flag users who haven't logged in for 30+ days.`,
      `Deactivate the ${ctx.inactiveCount || 'unused'} seat(s) in the admin console to stop recurring charges.`,
      'Establish a request-based flow for provisioning new seats only when active developers need them.'
    ]
  }
};

/**
 * Builds a standardized recommendation object combining math calculations 
 * with professional, startup-focused copywriting.
 * 
 * @param {string} ruleId The unique ID of the triggered rule
 * @param {Object} ruleMath Output from the savings calculator (currentMonthlyCost, optimizedMonthlyCost, estimatedMonthlySavings, estimatedYearlySavings, savingsLogic)
 * @param {string} priority The priority level ('high' | 'medium' | 'low')
 * @param {string} provider The provider key for iconography
 * @param {Object} customContext Context parameters to customize the template text
 * @returns {Object} Standardized recommendation object
 */
export function buildRecommendation(ruleId, ruleMath, priority, provider, customContext = {}) {
  // Try to find template by ruleId first, fallback to enterprise pattern if wildcarded
  let templateKey = ruleId;
  if (ruleId.startsWith('rule-oversized-enterprise-')) {
    templateKey = 'rule-oversized-enterprise';
  }

  const template = RECOMMENDATION_TEMPLATES[templateKey];
  
  if (!template) {
    throw new Error(`[CredLens] Missing explanation template for rule ID: ${ruleId}`);
  }

  const monthlySavings = ruleMath.estimatedMonthlySavings || 0;
  const yearlySavings = ruleMath.estimatedYearlySavings || 0;

  // Render title with customization if needed
  let title = template.title;
  if (templateKey === 'rule-oversized-enterprise' && customContext.toolName) {
    title = `Downgrade ${customContext.toolName} Enterprise Plan`;
  }

  // Resolve actionable steps dynamically
  const actionableSteps = typeof template.actionableSteps === 'function' 
    ? template.actionableSteps(customContext) 
    : template.actionableSteps;

  return {
    id: ruleId,
    provider,
    title,
    explanation: template.explanation,
    whyItMatters: template.whyItMatters,
    estimatedImpact: getImpactLabel(priority),
    estimatedSavings: {
      monthly: monthlySavings,
      yearly: yearlySavings,
      formattedMonthly: formatCurrency(monthlySavings, 'mo'),
      formattedYearly: formatCurrency(yearlySavings, 'yr'),
      logic: ruleMath.savingsLogic || ''
    },
    actionableSteps,
    
    // Backward Compatibility fields
    priority: priority.toLowerCase(),
    estimatedMonthlySavings: monthlySavings,
    estimatedYearlySavings: yearlySavings,
    optimizedMonthlyCost: ruleMath.optimizedMonthlyCost,
    currentMonthlyCost: ruleMath.currentMonthlyCost,
    savingsLogic: ruleMath.savingsLogic,
    description: template.explanation
  };
}

/**
 * Formats the final audit report, wrapping calculations in a clean,
 * reusable structure ready for frontend rendering, APIs, or export.
 * 
 * @param {Object} summary Raw calculations summary
 * @param {Array} recommendations Standardized recommendation list
 * @returns {Object} Structured audit report
 */
export function formatAuditReport(summary, recommendations) {
  const totalCurrentSpend = summary.currentMonthlySpend || 0;
  const totalEstimatedSavings = summary.totalPotentialSavings || 0;
  const optimizedSpendEstimate = summary.optimizedMonthlySpend || 0;

  // Build dictionary of simple explanations keyed by recommendation ID
  // for quick metadata retrieval or AI summary seeding
  const recommendationExplanations = {};
  recommendations.forEach(rec => {
    recommendationExplanations[rec.id] = {
      title: rec.title,
      summary: rec.explanation,
      justification: rec.whyItMatters,
      impact: rec.estimatedImpact,
      monthlySavings: rec.estimatedSavings.formattedMonthly
    };
  });

  return {
    summary: {
      totalCurrentSpend,
      optimizedSpendEstimate,
      totalEstimatedSavings,
      totalEstimatedYearlySavings: totalEstimatedSavings * 12,
      formattedCurrentSpend: formatCurrency(totalCurrentSpend, 'mo'),
      formattedOptimizedSpend: formatCurrency(optimizedSpendEstimate, 'mo'),
      formattedEstimatedSavings: formatCurrency(totalEstimatedSavings, 'mo'),
      formattedEstimatedYearlySavings: formatCurrency(totalEstimatedSavings * 12, 'yr'),
      runwayRestoredPercent: summary.runwayRestoredPercent || 0,
      subscriptionCost: summary.subscriptionCost || 0,
      apiSpend: summary.apiSpend || 0,
      apiAllocation: summary.apiAllocation || {},
      
      // Backward Compatibility summary fields
      totalPotentialSavings: totalEstimatedSavings,
      optimizedMonthlySpend: optimizedSpendEstimate,
      totalPotentialYearlySavings: totalEstimatedSavings * 12,
      currentMonthlySpend: totalCurrentSpend
    },
    recommendations,
    recommendationExplanations
  };
}
