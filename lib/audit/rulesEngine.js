import { PRICING_REGISTRY, calculatePlanCost, ENTERPRISE_ESTIMATED_RATES } from '../../data/pricing.js';
import { 
  sanitizeAuditInputs,
  calculateSubscriptionBaseline,
  buildSavingsResult,
  calculatePlanDowngradeSavings,
  calculateRedundantToolSavings,
  calculateApiStrategySavings 
} from './savingsCalculator.js';
import { buildRecommendation, formatAuditReport } from './explanationBuilder.js';

/**
 * Base Audit Rule class
 */
export class AuditRule {
  constructor({ id, category, title, priority }) {
    this.id = id;
    this.category = category; // 'redundancy' | 'tier-mismatch' | 'usage-efficiency' | 'governance' | 'underutilization'
    this.title = title;
    this.priority = priority; // 'high' | 'medium' | 'low'
  }

  evaluate(context) {
    throw new Error('evaluate() method must be implemented by subclasses.');
  }
}

/**
 * Rule 1: Copilot & Cursor seat overlaps
 */
export class CopilotCursorOverlapRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-copilot-cursor-overlap',
      category: 'redundancy',
      title: 'Consolidate Code Assistant Seats',
      priority: 'high'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    if (selectedTools.includes('cursor') && selectedTools.includes('copilot')) {
      const copilotPlanId = toolPlans.copilot;
      const copilotCost = calculatePlanCost('copilot', copilotPlanId, seatsCount);
      const planName = PRICING_REGISTRY.copilot.plans[copilotPlanId]?.name || 'Plan';
      
      const calc = calculateRedundantToolSavings(copilotCost, `GitHub Copilot (${planName})`);

      return buildRecommendation(this.id, calc, this.priority, 'copilot', { planName }, this.category);
    }
    return null;
  }
}

/**
 * Rule 2: Overlapping chat assistant tools (ChatGPT + Claude + Gemini Workspace)
 */
export class GeneralChatOverlapRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-general-chat-overlap',
      category: 'redundancy',
      title: 'Standardize Workspace Chat Subscriptions',
      priority: 'medium'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    
    // Find active chat tools
    const chatTools = ['chatgpt', 'claude', 'gemini'].filter(toolId => selectedTools.includes(toolId));
    
    if (chatTools.length >= 2) {
      // Calculate costs for all active chat assistants
      const costs = chatTools.map(toolId => {
        const planId = toolPlans[toolId];
        return {
          id: toolId,
          name: PRICING_REGISTRY[toolId].name,
          cost: calculatePlanCost(toolId, planId, seatsCount),
          planName: PRICING_REGISTRY[toolId].plans[planId]?.name || 'Plan'
        };
      });

      // Sort cost descending (keep most expensive/primary, suggest canceling others)
      costs.sort((a, b) => b.cost - a.cost);
      
      const primary = costs[0];
      const redundant = costs.slice(1);
      
      const redundantSavings = redundant.reduce((sum, item) => sum + item.cost, 0);
      const toolList = redundant.map(t => `${t.name} (${t.planName})`).join(' and ');
      
      const currentCost = costs.reduce((sum, item) => sum + item.cost, 0);
      const targetCost = primary.cost;
      
      const mathStr = redundant.map(t => `Cancel ${t.name} ($${t.cost}/mo)`).join(' + ') + ` = $${redundantSavings}/mo saved.`;
      const calc = buildSavingsResult(currentCost, targetCost, mathStr);

      return buildRecommendation(this.id, calc, this.priority, redundant[0].id, {
        choices: costs.map(c => c.name).join(' or '),
        redundantTools: toolList
      }, this.category);
    }
    return null;
  }
}

/**
 * Rule 3: ChatGPT Team plan with only 1 seat
 */
export class ChatGPTTeamMinSeatRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-chatgpt-team-min-seat',
      category: 'tier-mismatch',
      title: 'Downgrade ChatGPT Team to Plus',
      priority: 'medium'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    if (selectedTools.includes('chatgpt') && toolPlans.chatgpt === 'team' && seatsCount === 1) {
      const currentCost = calculatePlanCost('chatgpt', 'team', 1); // bills 2 seats minimum = $60
      const targetCost = calculatePlanCost('chatgpt', 'plus', 1);  // bills 1 seat = $20
      
      const calc = calculatePlanDowngradeSavings(
        currentCost, 
        targetCost, 
        'Downgrading ChatGPT Team (which enforces a 2-seat minimum) to individual Plus plan for 1 seat.'
      );

      return buildRecommendation(this.id, calc, this.priority, 'chatgpt', {}, this.category);
    }
    return null;
  }
}

/**
 * Rule 4: Claude Team plan with less than 5 seats
 */
export class ClaudeTeamMinSeatRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-claude-team-min-seat',
      category: 'tier-mismatch',
      title: 'Prune Claude Team Tier (Below Minimum)',
      priority: 'medium'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    if (selectedTools.includes('claude') && toolPlans.claude === 'team' && seatsCount < 5) {
      const currentCost = calculatePlanCost('claude', 'team', seatsCount); // bills 5 seats minimum = $150
      const targetCost = calculatePlanCost('claude', 'pro', seatsCount);  // bills actual seats at $20/ea
      
      const calc = calculatePlanDowngradeSavings(
        currentCost, 
        targetCost, 
        `Downgrading Claude Team (5-seat minimum) to Claude Pro for ${seatsCount} seat(s).`
      );

      return buildRecommendation(this.id, calc, this.priority, 'claude', { seatsCount }, this.category);
    }
    return null;
  }
}

/**
 * Rule 5: Oversized Enterprise plans for small teams (< 15 seats)
 */
export class OversizedEnterpriseRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-oversized-enterprise',
      category: 'underutilization',
      title: 'Downgrade Enterprise Subscriptions',
      priority: 'high'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    const recommendations = [];

    const enterpriseConfigs = [
      { toolId: 'chatgpt', targetPlanId: 'team', rate: ENTERPRISE_ESTIMATED_RATES.chatgpt, targetRate: 30, minEnterpriseSeats: 20 },
      { toolId: 'gemini', targetPlanId: 'business', rate: ENTERPRISE_ESTIMATED_RATES.gemini, targetRate: 30, minEnterpriseSeats: 15 },
      { toolId: 'v0_dev', targetPlanId: 'premium', rate: ENTERPRISE_ESTIMATED_RATES.v0_dev, targetRate: 20, minEnterpriseSeats: 10 }
    ];

    enterpriseConfigs.forEach(({ toolId, targetPlanId, rate, targetRate, minEnterpriseSeats }) => {
      if (selectedTools.includes(toolId) && toolPlans[toolId] === 'enterprise' && seatsCount < minEnterpriseSeats) {
        const toolName = PRICING_REGISTRY[toolId].name;
        const currentCost = rate * Math.max(minEnterpriseSeats, seatsCount);
        const targetCost = targetRate * seatsCount;
        
        const calc = calculatePlanDowngradeSavings(
          currentCost,
          targetCost,
          `Downgrading oversized ${toolName} Enterprise contract to self-serve ${PRICING_REGISTRY[toolId].plans[targetPlanId].name} plan.`
        );

        recommendations.push(
          buildRecommendation(`${this.id}-${toolId}`, calc, this.priority, toolId, {
            toolName,
            targetPlanName: PRICING_REGISTRY[toolId].plans[targetPlanId].name,
            targetRate
          }, this.category)
        );
      }
    });

    return recommendations.length > 0 ? recommendations : null;
  }
}

/**
 * Rule 6: Gemini Workspace to Advanced downgrade for very small teams
 */
export class GeminiWorkspaceLicensingRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-gemini-workspace-licensing',
      category: 'tier-mismatch',
      title: 'Optimize Gemini Workspace Licensing',
      priority: 'low'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount } = context;
    if (selectedTools.includes('gemini') && toolPlans.gemini === 'business' && seatsCount <= 2) {
      const currentCost = calculatePlanCost('gemini', 'business', seatsCount);
      const targetCost = 20 * seatsCount; // Gemini Advanced / Google One pricing
      
      const calc = calculatePlanDowngradeSavings(
        currentCost, 
        targetCost, 
        `Downgrading Gemini Business to Gemini Advanced (Google One AI Premium) for ${seatsCount} user(s).`
      );

      return buildRecommendation(this.id, calc, this.priority, 'gemini', { seatsCount }, this.category);
    }
    return null;
  }
}

/**
 * Rule 7: Anthropic API Prompt Caching
 */
export class AnthropicPromptCachingRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-anthropic-prompt-caching',
      category: 'usage-efficiency',
      title: 'Implement Claude Prompt Caching',
      priority: 'high'
    });
  }

  evaluate(context) {
    const { selectedTools, apiAllocation } = context;
    const anthropicSpend = apiAllocation.anthropic_api || 0;

    if (selectedTools.includes('anthropic_api') && anthropicSpend > 200) {
      const calc = calculateApiStrategySavings(anthropicSpend, 'prompt_caching', 'Anthropic Claude API');

      return buildRecommendation(this.id, calc, this.priority, 'anthropic_api', {}, this.category);
    }
    return null;
  }
}

/**
 * Rule 8: OpenAI API GPT-4o-mini Migration
 */
export class OpenAIMiniMigrationRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-openai-mini-migration',
      category: 'usage-efficiency',
      title: 'Migrate Workloads to GPT-4o-mini',
      priority: 'high'
    });
  }

  evaluate(context) {
    const { selectedTools, apiAllocation } = context;
    const openaiSpend = apiAllocation.openai_api || 0;

    if (selectedTools.includes('openai_api') && openaiSpend > 200) {
      const calc = calculateApiStrategySavings(openaiSpend, 'mini_migration', 'OpenAI API');

      return buildRecommendation(this.id, calc, this.priority, 'openai_api', {}, this.category);
    }
    return null;
  }
}

/**
 * Rule 9: OpenAI Context Window Pruning
 */
export class OpenAIContextPruningRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-openai-context-pruning',
      category: 'usage-efficiency',
      title: 'Prune System Prompts & History Context',
      priority: 'medium'
    });
  }

  evaluate(context) {
    const { selectedTools, apiAllocation } = context;
    const openaiSpend = apiAllocation.openai_api || 0;

    if (selectedTools.includes('openai_api') && openaiSpend > 500) {
      const calc = calculateApiStrategySavings(openaiSpend, 'context_pruning', 'OpenAI API');

      return buildRecommendation(this.id, calc, this.priority, 'openai_api', {}, this.category);
    }
    return null;
  }
}

/**
 * Rule 10: Inactive/unused user seats deactivation
 */
export class PruneInactiveSeatsRule extends AuditRule {
  constructor() {
    super({
      id: 'rule-unused-seats',
      category: 'underutilization',
      title: 'Prune Inactive Member Seats',
      priority: 'medium'
    });
  }

  evaluate(context) {
    const { selectedTools, toolPlans, seatsCount, inactiveSeatsCount } = context;
    
    // Check if we have inactive seats to prune.
    // If team has inactiveSeatsCount explicitly provided and > 0, we use it.
    // If not, we estimate: if seatsCount >= 5, we assume 20% are inactive (rounded down).
    let inactiveCount = 0;
    if (inactiveSeatsCount !== undefined && inactiveSeatsCount > 0) {
      inactiveCount = Math.min(inactiveSeatsCount, seatsCount - 1); // Keep at least 1 seat active
    } else if (seatsCount >= 5) {
      inactiveCount = Math.floor(seatsCount * 0.20); // 20% seat leak baseline
    }

    if (inactiveCount <= 0) return null;

    // Calculate total cost of inactive seats across subscription tools
    let currentCost = 0;
    let targetCost = 0;
    const details = [];

    selectedTools.forEach(toolId => {
      const tool = PRICING_REGISTRY[toolId];
      if (tool && tool.type === 'subscription') {
        const planId = toolPlans[toolId];
        const plan = tool.plans[planId];
        if (plan) {
          // Calculate cost for full seats and cost with inactive seats removed
          const costFull = calculatePlanCost(toolId, planId, seatsCount);
          const costReduced = calculatePlanCost(toolId, planId, seatsCount - inactiveCount);
          const savings = costFull - costReduced;
          if (savings > 0) {
            currentCost += costFull;
            targetCost += costReduced;
            details.push(`${tool.name} ($${plan.monthlyCost}/seat * ${inactiveCount} inactive seats = $${savings}/mo saved)`);
          }
        }
      }
    });

    if (currentCost - targetCost <= 0) return null;

    const mathStr = details.join(' + ') + ` = $${currentCost - targetCost}/mo total savings.`;
    const calc = buildSavingsResult(currentCost, targetCost, mathStr);

    return buildRecommendation(this.id, calc, this.priority, 'all', {
      inactiveCount,
      toolName: selectedTools.map(t => PRICING_REGISTRY[t]?.name).filter(Boolean).join(', ')
    }, this.category);
  }
}

// Registry of active rules
export const AUDIT_RULES = [
  new CopilotCursorOverlapRule(),
  new GeneralChatOverlapRule(),
  new ChatGPTTeamMinSeatRule(),
  new ClaudeTeamMinSeatRule(),
  new OversizedEnterpriseRule(),
  new GeminiWorkspaceLicensingRule(),
  new AnthropicPromptCachingRule(),
  new OpenAIMiniMigrationRule(),
  new OpenAIContextPruningRule(),
  new PruneInactiveSeatsRule()
];

/**
 * Coordinate and run all registered audit recommendation rules.
 * 
 * @param {Object} formData Form inputs containing selected tools, plan choices, seats, and monthly spend.
 * @returns {Object} Structured audit report summary and recommendation details.
 */
export function runSpendAudit(formData) {
  // 1. Sanitize inputs using the calculator sanitization boundaries
  const sanitized = sanitizeAuditInputs(formData);
  const { tools: selectedTools, toolPlans, seats: seatsCount, monthlySpend, useCase, optimizationGoal, inactiveSeatsCount } = sanitized;

  // 2. Calculate baseline subscription costs using calculator baseline helper
  const subscriptionCost = calculateSubscriptionBaseline(selectedTools, toolPlans, seatsCount);

  // 3. Calculate remaining API spend and allocate
  const totalApiSpend = Math.max(0, monthlySpend - subscriptionCost);
  const activeApis = selectedTools.filter(toolId => {
    const tool = PRICING_REGISTRY[toolId];
    return tool && tool.type === 'api';
  });

  const apiAllocation = {};
  if (activeApis.length > 0) {
    if (activeApis.includes('openai_api') && activeApis.includes('anthropic_api')) {
      if (useCase === 'coding') {
        apiAllocation.anthropic_api = Math.round(totalApiSpend * 0.60);
        apiAllocation.openai_api = Math.round(totalApiSpend * 0.40);
      } else if (useCase === 'writing' || useCase === 'research') {
        apiAllocation.anthropic_api = Math.round(totalApiSpend * 0.50);
        apiAllocation.openai_api = Math.round(totalApiSpend * 0.50);
      } else {
        apiAllocation.anthropic_api = Math.round(totalApiSpend * 0.50);
        apiAllocation.openai_api = Math.round(totalApiSpend * 0.50);
      }
    } else if (activeApis.includes('openai_api')) {
      apiAllocation.openai_api = totalApiSpend;
    } else if (activeApis.includes('anthropic_api')) {
      apiAllocation.anthropic_api = totalApiSpend;
    }
  }

  // 4. Assemble evaluating context
  const context = {
    selectedTools,
    toolPlans,
    seatsCount,
    monthlySpend,
    useCase,
    optimizationGoal,
    subscriptionCost,
    apiSpend: totalApiSpend,
    apiAllocation,
    inactiveSeatsCount
  };

  // 5. Run rules
  const recommendations = [];
  AUDIT_RULES.forEach(rule => {
    try {
      const result = rule.evaluate(context);
      if (result) {
        if (Array.isArray(result)) {
          recommendations.push(...result);
        } else {
          recommendations.push(result);
        }
      }
    } catch (err) {
      console.error(`[CredLens] Error evaluating rule ${rule.id}:`, err);
    }
  });

  // 6. Calculate summary metrics
  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedMonthlySavings, 0);
  const optimizedSpend = Math.max(0, monthlySpend - totalPotentialSavings);
  const runwayRestoredPercent = monthlySpend > 0 ? ((totalPotentialSavings / monthlySpend) * 100).toFixed(1) : '0.0';

  const rawSummary = {
    currentMonthlySpend: monthlySpend,
    optimizedMonthlySpend: optimizedSpend,
    totalPotentialSavings,
    runwayRestoredPercent: parseFloat(runwayRestoredPercent),
    subscriptionCost,
    apiSpend: totalApiSpend,
    apiAllocation
  };

  return formatAuditReport(rawSummary, recommendations);
}
