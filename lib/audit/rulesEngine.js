import { PRICING_REGISTRY, calculatePlanCost, ENTERPRISE_ESTIMATED_RATES } from '../../data/pricing.js';

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

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'copilot',
        condition: 'Active subscriptions for both Cursor and GitHub Copilot.',
        currentCost: copilotCost,
        targetCost: 0,
        estimatedSavings: copilotCost,
        savingsLogic: `GitHub Copilot (${planName}) cost of $${PRICING_REGISTRY.copilot.plans[copilotPlanId]?.monthlyCost || 0}/seat/mo * ${seatsCount} seat(s) = $${copilotCost}/mo.`,
        description: `Your team is running both Cursor and GitHub Copilot. Cursor includes built-in copilot autocomplete and codebase indexing features, rendering separate Copilot licenses redundant.`,
        actionableSteps: [
          'Audit developer IDE usage to confirm team standard is moving to Cursor.',
          `Deactivate GitHub Copilot (${planName}) seats inside the GitHub organization billing console.`,
          'Configure Cursor settings to use Cursor\'s built-in tab completion features.'
        ]
      };
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
      
      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: redundant[0].id, // Reference first redundant provider for icon
        condition: `Multiple general-purpose chat assistants selected: ${chatTools.join(', ')}.`,
        currentCost: costs.reduce((sum, item) => sum + item.cost, 0),
        targetCost: primary.cost,
        estimatedSavings: redundantSavings,
        savingsLogic: redundant.map(t => `Cancel ${t.name} ($${t.cost}/mo)`).join(' + ') + ` = $${redundantSavings}/mo saved.`,
        description: `Your team has active subscriptions for ChatGPT, Claude, and/or Gemini Workspace. Standardizing on a single workspace chat tool avoids paying for overlapping capabilities.`,
        actionableSteps: [
          `Survey the team to select either ${costs.map(c => c.name).join(' or ')} as the primary workspace assistant.`,
          `Cancel active subscription licenses for the secondary tool(s): ${toolList}.`,
          `Transition all project threads, documents, and writing workflows to the primary tool: ${primary.name}.`
        ]
      };
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
      const savings = currentCost - targetCost;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'chatgpt',
        condition: 'ChatGPT Team selected with exactly 1 user seat.',
        currentCost,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `Billed at 2-seat minimum on ChatGPT Team ($60/mo) vs. 1 seat on ChatGPT Plus ($20/mo) = $${savings}/mo savings.`,
        description: `ChatGPT Team requires a minimum of 2 seats ($60/mo). For solo users, downgrading to ChatGPT Plus provides the same core model capabilities and saves $40/mo.`,
        actionableSteps: [
          'Log in to the ChatGPT Workspace console as Administrator.',
          'Navigate to Settings -> Billing and cancel the Team plan subscription.',
          'Sign up for an individual ChatGPT Plus subscription using the same email address.'
        ]
      };
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
      const savings = currentCost - targetCost;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'claude',
        condition: `Claude Team selected with ${seatsCount} user seat(s) (minimum is 5).`,
        currentCost,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `Billed at 5-seat minimum on Claude Team ($150/mo) vs. ${seatsCount} seats on Claude Pro ($20 * ${seatsCount} = $${targetCost}/mo) = $${savings}/mo savings.`,
        description: `Claude Team plan has a 5-seat billing floor ($150/mo). For teams smaller than 5, subscribing to individual Claude Pro licenses is cheaper and provides comparable features.`,
        actionableSteps: [
          'Go to the Claude.ai team management billing dashboard.',
          'Deactivate the Team subscription and export shared documents.',
          `Invite team members to register individual Claude Pro seats ($20/mo per user).`
        ]
      };
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
        const savings = currentCost - targetCost;

        recommendations.push({
          id: `${this.id}-${toolId}`,
          category: this.category,
          title: `Downgrade ${toolName} Enterprise Plan`,
          priority: this.priority,
          provider: toolId,
          condition: `${toolName} Enterprise selected for a small team (${seatsCount} seats).`,
          currentCost,
          targetCost,
          estimatedSavings: savings,
          savingsLogic: `Estimated Enterprise cost ($${rate}/seat * ${Math.max(minEnterpriseSeats, seatsCount)} min seats = $${currentCost}/mo) vs. Self-Serve Tier ($${targetRate}/seat * ${seatsCount} seats = $${targetCost}/mo) = $${savings}/mo savings.`,
          description: `${toolName} Enterprise contracts require minimum seat commitments and feature overhead that are inefficient for teams with ${seatsCount} seat(s). Downgrading to the self-serve team tier yields massive savings with matching model features.`,
          actionableSteps: [
            `Contact the ${toolName} account executive to cancel the Enterprise agreement.`,
            `Migrate user seats to the self-serve ${PRICING_REGISTRY[toolId].plans[targetPlanId].name} plan (billed at $${targetRate}/seat/mo).`,
            `Configure billing settings to use corporate credit card invoicing.`
          ]
        });
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
      const savings = currentCost - targetCost;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'gemini',
        condition: 'Gemini Business subscription selected with <= 2 seats.',
        currentCost,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `Gemini Business ($30/seat/mo * ${seatsCount} seat(s)) vs. Gemini Advanced ($20/mo * ${seatsCount} user(s)) = $${savings}/mo savings.`,
        description: `Gemini Business adds heavy administrative features to Google Workspace. For teams of <= 2 users, downgrading to Gemini Advanced (via Google One) offers standard LLM access for $10/mo less per seat.`,
        actionableSteps: [
          'Access the Google Workspace Admin console.',
          'Navigate to Billing -> Subscriptions and cancel Gemini Business licenses.',
          `Instruct users to subscribe to Google One AI Premium ($19.99/mo) individually if Workspace integrations aren't critical.`
        ]
      };
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
      const savings = Math.round(anthropicSpend * 0.40);
      const targetCost = anthropicSpend - savings;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'anthropic_api',
        condition: `Anthropic API selected with high usage ($${anthropicSpend}/mo).`,
        currentCost: anthropicSpend,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `Claude API spend ($${anthropicSpend}/mo) * 40% estimated prompt caching savings = $${savings}/mo.`,
        description: `Anthropic supports prompt caching for recurrent prompts, developer instruction backlogs, and large documents (> 1,024 tokens). Transitioning to cache headers yields an average 40% reduction in API fees.`,
        actionableSteps: [
          'Add the header "anthropic-beta: prompt-caching-2024-07-31" to API client configurations.',
          'Structure payload arrays so static elements (system messages, tools) are placed first.',
          'Add {"type": "ephemeral"} to the cache_control parameters for system prompts.'
        ]
      };
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
      const savings = Math.round(openaiSpend * 0.35); // 35% estimated savings
      const targetCost = openaiSpend - savings;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'openai_api',
        condition: `OpenAI API selected with high usage ($${openaiSpend}/mo).`,
        currentCost: openaiSpend,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `OpenAI API spend ($${openaiSpend}/mo) * 35% estimated savings (migrating 50% of traffic to GPT-4o-mini which is 80% cheaper) = $${savings}/mo.`,
        description: `Running simple utility tasks (like text classification, data extraction, and formatting) on GPT-4 or GPT-4o is cost-inefficient. GPT-4o-mini is 80% cheaper and offers faster response speeds.`,
        actionableSteps: [
          'Audit API logs to identify endpoints running low-complexity tasks (parsing, metadata tagging).',
          'Modify endpoint request configurations, changing model parameter from "gpt-4o" to "gpt-4o-mini".',
          'Validate output quality on mini and enjoy faster response latency.'
        ]
      };
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
      const savings = Math.round(openaiSpend * 0.15); // 15% savings
      const targetCost = openaiSpend - savings;

      return {
        id: this.id,
        category: this.category,
        title: this.title,
        priority: this.priority,
        provider: 'openai_api',
        condition: `OpenAI API selected with spend > $500/mo ($${openaiSpend}/mo).`,
        currentCost: openaiSpend,
        targetCost,
        estimatedSavings: savings,
        savingsLogic: `OpenAI API spend ($${openaiSpend}/mo) * 15% prompt compression & context limits = $${savings}/mo.`,
        description: `Unoptimized system messages and trailing message stacks bloat your API requests. Trimming redundant logs and minifying system instructions reduces prompt overhead by 15% on average.`,
        actionableSteps: [
          'Minify static system instructions (remove unnecessary spaces, guidelines, and markdown tags).',
          'Implement message context compression (e.g. summarize older conversation logs rather than sending raw histories).',
          'Set explicit max_tokens parameters on completion endpoints.'
        ]
      };
    }
    return null;
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
  new OpenAIContextPruningRule()
];

/**
 * Coordinate and run all registered audit recommendation rules.
 * 
 * @param {Object} formData Form inputs containing selected tools, plan choices, seats, and monthly spend.
 * @returns {Object} Structured audit report summary and recommendation details.
 */
export function runSpendAudit(formData) {
  const selectedTools = formData.tools || [];
  const toolPlans = formData.toolPlans || {};
  const seatsCount = Number(formData.seats) || 1;
  const monthlySpend = Number(formData.monthlySpend) || 0;
  const useCase = formData.useCase || 'mixed_usage';
  const optimizationGoal = formData.optimizationGoal || '';

  // 1. Calculate computed baseline subscriptions cost
  let subscriptionCost = 0;
  selectedTools.forEach(toolId => {
    const planId = toolPlans[toolId];
    const tool = PRICING_REGISTRY[toolId];
    if (tool) {
      if (tool.type === 'subscription') {
        const plan = tool.plans[planId];
        if (plan) {
          if (plan.pricingType === 'custom' || plan.monthlyCost === null) {
            // Enterprise custom baseline estimation
            const rate = ENTERPRISE_ESTIMATED_RATES[toolId] || 40;
            const minSeats = toolId === 'chatgpt' ? 20 : toolId === 'gemini' ? 15 : 10;
            subscriptionCost += rate * Math.max(minSeats, seatsCount);
          } else {
            subscriptionCost += calculatePlanCost(toolId, planId, seatsCount);
          }
        }
      }
    }
  });

  // 2. Calculate remaining API spend and allocate
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

  // 3. Assemble evaluating context
  const context = {
    selectedTools,
    toolPlans,
    seatsCount,
    monthlySpend,
    useCase,
    optimizationGoal,
    subscriptionCost,
    apiSpend: totalApiSpend,
    apiAllocation
  };

  // 4. Run rules
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

  // 5. Calculate summary metrics
  const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedSavings, 0);
  const optimizedSpend = Math.max(0, monthlySpend - totalPotentialSavings);
  const runwayRestoredPercent = monthlySpend > 0 ? ((totalPotentialSavings / monthlySpend) * 100).toFixed(1) : '0.0';

  return {
    summary: {
      currentMonthlySpend: monthlySpend,
      optimizedMonthlySpend: optimizedSpend,
      totalPotentialSavings,
      runwayRestoredPercent: parseFloat(runwayRestoredPercent),
      subscriptionCost,
      apiSpend: totalApiSpend,
      apiAllocation
    },
    recommendations
  };
}
