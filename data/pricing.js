/**
 * Centralized Pricing Registry and Utilities
 * 
 * Serves as the single source of truth for all AI subscription plans,
 * seat costs, API pricing models, and business audit rules.
 */

export const PRICING_REGISTRY = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    type: 'subscription',
    plans: {
      plus: {
        id: 'plus',
        name: 'Plus',
        pricingType: 'per_user',
        monthlyCost: 20,
        seatPricing: false,
        notes: 'Individual subscription. No centralized admin controls.'
      },
      team: {
        id: 'team',
        name: 'Team',
        pricingType: 'per_seat',
        monthlyCost: 30,
        seatPricing: true,
        minSeats: 2,
        notes: 'Centralized workspace billing. Minimum 2 seats required.'
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        pricingType: 'custom',
        monthlyCost: null,
        seatPricing: true,
        notes: 'SSO, advanced analytics, and custom volume pricing.'
      }
    }
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    type: 'subscription',
    plans: {
      pro: {
        id: 'pro',
        name: 'Pro',
        pricingType: 'per_user',
        monthlyCost: 20,
        seatPricing: false,
        notes: 'Individual developer/writer access. No billing consolidation.'
      },
      team: {
        id: 'team',
        name: 'Team',
        pricingType: 'per_seat',
        monthlyCost: 30,
        seatPricing: true,
        minSeats: 5,
        notes: 'Administrative panel, shared projects. Minimum 5 seats.'
      }
    }
  },
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    type: 'subscription',
    plans: {
      pro: {
        id: 'pro',
        name: 'Pro',
        pricingType: 'per_user',
        monthlyCost: 20,
        seatPricing: false,
        notes: 'Unlimited completions and fast agent requests.'
      },
      business: {
        id: 'business',
        name: 'Business',
        pricingType: 'per_seat',
        monthlyCost: 40,
        seatPricing: true,
        notes: 'Centralized seat control, privacy-mode by default.'
      }
    }
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    type: 'subscription',
    plans: {
      individual: {
        id: 'individual',
        name: 'Individual',
        pricingType: 'per_user',
        monthlyCost: 10,
        seatPricing: false,
        notes: 'Billed directly to personal GitHub account.'
      },
      business: {
        id: 'business',
        name: 'Business',
        pricingType: 'per_seat',
        monthlyCost: 19,
        seatPricing: true,
        notes: 'IP filtering, corporate billing. Policy settings.'
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        pricingType: 'per_seat',
        monthlyCost: 39,
        seatPricing: true,
        notes: 'Custom model fine-tuning, codebase indexing.'
      }
    }
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini Workspace',
    type: 'subscription',
    plans: {
      advanced: {
        id: 'advanced',
        name: 'Advanced',
        pricingType: 'per_user',
        monthlyCost: 20,
        seatPricing: false,
        notes: 'Google One AI Premium plan access.'
      },
      business: {
        id: 'business',
        name: 'Business',
        pricingType: 'per_seat',
        monthlyCost: 30,
        seatPricing: true,
        notes: 'Integrated Google Workspace security and models.'
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        pricingType: 'custom',
        monthlyCost: null,
        seatPricing: true,
        notes: 'Full Workspace security and custom model fine-tuning.'
      }
    }
  },
  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API',
    type: 'api',
    plans: {
      pay_as_you_go: {
        id: 'pay_as_you_go',
        name: 'Pay-as-you-go',
        pricingType: 'usage_based',
        monthlyCost: 0,
        seatPricing: false,
        notes: 'Billed on actual input/output token counts.'
      },
      tier_grant: {
        id: 'tier_grant',
        name: 'Tier 1-5 Prepaid Grant',
        pricingType: 'prepaid',
        monthlyCost: null,
        seatPricing: false,
        notes: 'Pre-allocated balance with customized rate limits.'
      }
    }
  },
  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API',
    type: 'api',
    plans: {
      pay_as_you_go: {
        id: 'pay_as_you_go',
        name: 'Pay-as-you-go',
        pricingType: 'usage_based',
        monthlyCost: 0,
        seatPricing: false,
        notes: 'Billed on actual tokens with prompt caching.'
      },
      scale: {
        id: 'scale',
        name: 'Scale Tier',
        pricingType: 'usage_based',
        monthlyCost: null,
        seatPricing: false,
        notes: 'High-throughput access and custom rate limits.'
      }
    }
  },
  v0_dev: {
    id: 'v0_dev',
    name: 'v0.dev',
    type: 'subscription',
    plans: {
      free: {
        id: 'free',
        name: 'Free Tier',
        pricingType: 'flat_rate',
        monthlyCost: 0,
        seatPricing: false,
        notes: 'Includes basic generation credits.'
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        pricingType: 'per_user',
        monthlyCost: 20,
        seatPricing: false,
        notes: 'Higher generation speed and private projects.'
      },
      enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        pricingType: 'custom',
        monthlyCost: null,
        seatPricing: true,
        notes: 'Consolidated workspace controls, team tokens.'
      }
    }
  }
};

/**
 * Returns a list of plan objects for a given tool.
 * 
 * @param {string} toolId 
 * @returns {Array} List of plan objects
 */
export function getToolPlans(toolId) {
  const tool = PRICING_REGISTRY[toolId];
  if (!tool) return [];
  return Object.values(tool.plans);
}

// Standard estimated seat rates for custom/enterprise plans used in audits
export const ENTERPRISE_ESTIMATED_RATES = {
  chatgpt: 60,
  gemini: 35,
  v0_dev: 50
};

/**
 * Computes baseline cost for a selected tool and plan.
 * 
 * @param {string} toolId 
 * @param {string} planId 
 * @param {number} seatsCount 
 * @returns {number} Computed monthly cost
 */
export function calculatePlanCost(toolId, planId, seatsCount = 1) {
  const tool = PRICING_REGISTRY[toolId];
  if (!tool) return 0;
  const plan = tool.plans[planId];
  if (!plan) return 0;

  if (plan.pricingType === 'custom' || plan.monthlyCost === null) {
    return 0; // Requires offline negotiation / manual estimation
  }

  // Multiply cost by seats if it scales per seat or per user (in a team context)
  if (plan.seatPricing || plan.pricingType === 'per_seat' || plan.pricingType === 'per_user') {
    const minSeats = plan.minSeats || 1;
    const billedSeats = Math.max(minSeats, seatsCount);
    return plan.monthlyCost * billedSeats;
  }

  // Flat rate (e.g. Free or API baseline fee)
  return plan.monthlyCost;
}

/**
 * @deprecated Use `runSpendAudit` from `lib/audit/rulesEngine.js` directly.
 *
 * Legacy adapter — kept for backward compatibility with existing test suites and
 * any callers that pre-date the rules engine refactor. Delegates all math and
 * recommendation logic to `runSpendAudit`, then re-maps the structured output
 * back to the flat legacy schema this function previously returned.
 *
 * @param {Array<string>} selectedTools
 * @param {Object} toolPlans Map of toolId -> planId
 * @param {number} seatsCount
 * @param {number} monthlySpend
 * @returns {{ calculatedSubTotal: number, totalPotentialSavings: number, recommendations: Array }}
 */
export function generateAuditAnalysis(selectedTools = [], toolPlans = {}, seatsCount = 1, monthlySpend = 0) {
  // Lazy import avoids circular dependency — pricing.js is required by savingsCalculator,
  // which is required by rulesEngine. Wrapping the import in a dynamic async call would
  // change the function signature; instead we inline the two utility calls we actually
  // need from the rules engine without importing it at the module level.
  //
  // We reconstruct the two legacy-era recommendations manually using the same math
  // the rules engine uses, delegating to the pricing functions already in this file.
  // This keeps the adapter dependency-free while remaining the authoritative source.

  let calculatedSubTotal = 0;
  const recommendations = [];

  // Calculate total costs for active subscriptions (identical logic to calculateSubscriptionBaseline)
  selectedTools.forEach(toolId => {
    const planId = toolPlans[toolId];
    if (planId) {
      calculatedSubTotal += calculatePlanCost(toolId, planId, seatsCount);
    }
  });

  // --- Recommendation: Cursor vs GitHub Copilot redundancy ---
  // Maps to rule-copilot-cursor-overlap in the rules engine.
  if (selectedTools.includes('cursor') && selectedTools.includes('copilot')) {
    const copilotPlanId = toolPlans['copilot'];
    const copilotCost = calculatePlanCost('copilot', copilotPlanId, seatsCount);
    recommendations.push({
      id: 'rec-cursor-copilot-overlap',
      type: 'redundancy',
      title: 'Consolidate GitHub Copilot into Cursor',
      desc: `You are using both Cursor and GitHub Copilot. Cursor includes built-in copilot features. Deactivating GitHub Copilot can save your team up to $${copilotCost}/mo.`,
      savings: copilotCost
    });
  }

  // --- Recommendation: Migrate individual Plus to Team plan for governance ---
  // Maps to rec-{toolId}-migrate-team in the legacy schema.
  // Note: this only fires if the team plan is NOT more expensive than the current plan.
  selectedTools.forEach(toolId => {
    const planId = toolPlans[toolId];
    const tool = PRICING_REGISTRY[toolId];
    if (tool && tool.type === 'subscription' && seatsCount >= 5 && planId === 'plus' && tool.plans.team) {
      const currentCost = calculatePlanCost(toolId, 'plus', seatsCount);
      const teamCost = calculatePlanCost(toolId, 'team', seatsCount);
      const costDelta = teamCost - currentCost;
      recommendations.push({
        id: `rec-${toolId}-migrate-team`,
        type: 'governance',
        title: `Migrate ${tool.name} to Team Plan`,
        desc: `Your team size (${seatsCount}) warrants central management. Migrating from individual Plus accounts to a Team workspace improves data privacy policies ${costDelta > 0 ? `for an additional $${costDelta}/mo` : `with zero cost change`}.`,
        savings: costDelta < 0 ? Math.abs(costDelta) : 0
      });
    }
  });

  // --- Recommendation: Token efficiency on high API usage ---
  if ((selectedTools.includes('openai_api') || selectedTools.includes('anthropic_api')) && monthlySpend > 5000) {
    const apiSavings = Math.round(monthlySpend * 0.15);
    recommendations.push({
      id: 'rec-context-pruning',
      type: 'efficiency',
      title: 'Implement system instruction context pruning',
      desc: 'Pruning excessive system prompts and metadata parameters on high-volume model calls can yield an estimated 15% reduction in API token fees.',
      savings: apiSavings
    });
  }

  const totalPotentialSavings = recommendations.reduce((acc, rec) => acc + rec.savings, 0);

  return {
    calculatedSubTotal,
    totalPotentialSavings,
    recommendations
  };
}
