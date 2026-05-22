import { PRICING_REGISTRY, calculatePlanCost, ENTERPRISE_ESTIMATED_RATES } from '../../data/pricing.js';

/**
 * Sanitizes and normalizes the audit form input fields.
 * Handles boundary edge cases like empty values, invalid numbers, negative sizes, or strings.
 * 
 * @param {Object} formData Raw form data from the client
 * @returns {Object} Cleaned and typed form data
 */
export function sanitizeAuditInputs(formData) {
  if (!formData || typeof formData !== 'object') {
    return {
      tools: [],
      toolPlans: {},
      seats: 1,
      monthlySpend: 0,
      useCase: 'mixed_usage',
      optimizationGoal: ''
    };
  }

  // Sanitizing tools list
  const rawTools = Array.isArray(formData.tools) ? formData.tools : [];
  const tools = rawTools.filter(t => t && typeof t === 'string' && PRICING_REGISTRY[t]);

  // Sanitizing toolPlans map
  const rawPlans = formData.toolPlans && typeof formData.toolPlans === 'object' ? formData.toolPlans : {};
  const toolPlans = {};
  tools.forEach(toolId => {
    const planId = rawPlans[toolId];
    // Default to the first plan in the registry if not defined or invalid
    const validPlans = PRICING_REGISTRY[toolId]?.plans || {};
    if (planId && validPlans[planId]) {
      toolPlans[toolId] = planId;
    } else {
      const defaultPlanId = Object.keys(validPlans)[0];
      if (defaultPlanId) {
        toolPlans[toolId] = defaultPlanId;
      }
    }
  });

  // Sanitizing seat counts (must be a whole integer >= 1)
  let seats = 1;
  if ('seats' in formData) {
    const parsedSeats = parseInt(formData.seats, 10);
    seats = !isNaN(parsedSeats) && parsedSeats >= 1 ? parsedSeats : 1;
  }

  // Sanitizing monthly spend (must be a positive decimal >= 0)
  let monthlySpend = 0;
  if ('monthlySpend' in formData) {
    const parsedSpend = parseFloat(formData.monthlySpend);
    monthlySpend = !isNaN(parsedSpend) && parsedSpend >= 0 ? parsedSpend : 0;
  }

  // Sanitizing useCase enum
  const validUseCases = ['coding', 'writing', 'research', 'data_analysis', 'mixed_usage'];
  const useCase = validUseCases.includes(formData.useCase) ? formData.useCase : 'mixed_usage';

  // Sanitizing optimizationGoal string
  const optimizationGoal = typeof formData.optimizationGoal === 'string' ? formData.optimizationGoal.trim().substring(0, 200) : '';

  return {
    tools,
    toolPlans,
    seats,
    monthlySpend,
    useCase,
    optimizationGoal
  };
}

/**
 * Computes subscription subtotal including standard custom enterprise price projections.
 * 
 * @param {Array<string>} selectedTools Active tool IDs
 * @param {Object} toolPlans Map of toolId -> planId
 * @param {number} seatsCount Sanitize-validated team seat size
 * @returns {number} Computed monthly subscription commit cost
 */
export function calculateSubscriptionBaseline(selectedTools = [], toolPlans = {}, seatsCount = 1) {
  let subtotal = 0;
  selectedTools.forEach(toolId => {
    const planId = toolPlans[toolId];
    const tool = PRICING_REGISTRY[toolId];
    if (tool && tool.type === 'subscription') {
      const plan = tool.plans[planId];
      if (plan) {
        if (plan.pricingType === 'custom' || plan.monthlyCost === null) {
          // Enterprise projection pricing
          const rate = ENTERPRISE_ESTIMATED_RATES[toolId] || 40;
          const minSeats = toolId === 'chatgpt' ? 20 : toolId === 'gemini' ? 15 : 10;
          subtotal += rate * Math.max(minSeats, seatsCount);
        } else {
          subtotal += calculatePlanCost(toolId, planId, seatsCount);
        }
      }
    }
  });
  return subtotal;
}

/**
 * Standard formatter helper to build consistent cost calculation objects.
 * 
 * @param {number} currentMonthly Current spend baseline
 * @param {number} optimizedMonthly Target spend baseline after consolidation
 * @param {string} logicMessage Clear explanation of the savings math
 * @returns {Object} Formatted savings object
 */
export function buildSavingsResult(currentMonthly, optimizedMonthly, logicMessage = '') {
  // Ensure we don't return negative costs or impossible values
  const current = Math.max(0, currentMonthly);
  const optimized = Math.max(0, Math.min(current, optimizedMonthly));
  
  const roundedCurrent = Math.round(current);
  const roundedOptimized = Math.round(optimized);
  const monthlySavings = roundedCurrent - roundedOptimized;
  const yearlySavings = monthlySavings * 12;

  return {
    currentMonthlyCost: roundedCurrent,
    optimizedMonthlyCost: roundedOptimized,
    estimatedMonthlySavings: monthlySavings,
    estimatedYearlySavings: yearlySavings,
    savingsLogic: logicMessage
  };
}

/**
 * Calculates savings for plan downgrades (e.g. ChatGPT Team to Plus).
 * 
 * @param {number} currentCost Cost of the current plan setup
 * @param {number} targetCost Cost of the proposed plan setup
 * @param {string} notes Additional contextual detail for the math explanation
 * @returns {Object} Savings result object
 */
export function calculatePlanDowngradeSavings(currentCost, targetCost, notes = '') {
  const savings = Math.max(0, currentCost - targetCost);
  const mathStr = `$${currentCost}/mo current vs. $${targetCost}/mo target plan = $${savings}/mo savings. ${notes}`;
  return buildSavingsResult(currentCost, targetCost, mathStr.trim());
}

/**
 * Calculates savings when consolidating redundant tools (e.g. Cursor & Copilot).
 * 
 * @param {number} redundantToolCost Cost of the tool being deactivated
 * @param {string} toolName Name of the deactivated tool
 * @returns {Object} Savings result object
 */
export function calculateRedundantToolSavings(redundantToolCost, toolName = '') {
  const mathStr = `Deactivating ${toolName} saves the full monthly expense of $${redundantToolCost}/mo.`;
  return buildSavingsResult(redundantToolCost, 0, mathStr);
}

/**
 * Calculates API-specific optimizations based on strategies.
 * 
 * @param {number} apiSpend Total monthly spend allocated to this API
 * @param {string} strategy 'prompt_caching' | 'mini_migration' | 'context_pruning'
 * @param {string} apiLabel Name label of the API
 * @returns {Object} Savings result object
 */
export function calculateApiStrategySavings(apiSpend, strategy, apiLabel = 'API') {
  if (apiSpend <= 0) {
    return buildSavingsResult(0, 0, 'No active API spend recorded.');
  }

  let rate = 0;
  let description = '';

  switch (strategy) {
    case 'prompt_caching':
      rate = 0.40; // 40% average caching savings
      description = `40% average API spend reduction via Anthropic prompt caching integration`;
      break;
    case 'mini_migration':
      rate = 0.35; // 35% mini model routing savings
      description = `35% average API spend reduction by routing 50% of traffic to GPT-4o-mini (which is 80% cheaper)`;
      break;
    case 'context_pruning':
      rate = 0.15; // 15% context limits savings
      description = `15% average API spend reduction through prompt compression and context window limits`;
      break;
    default:
      rate = 0;
      description = 'Unknown strategy';
  }

  const savings = apiSpend * rate;
  const optimized = apiSpend - savings;
  const mathStr = `$${Math.round(apiSpend)}/mo spend * ${Math.round(rate * 100)}% savings rate = $${Math.round(savings)}/mo. (${description})`;

  return buildSavingsResult(apiSpend, optimized, mathStr);
}
