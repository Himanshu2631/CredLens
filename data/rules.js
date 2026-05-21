/**
 * Static AI cost optimization rules.
 * Used by the front-end UI and future backend audit engines to map raw API consumption
 * to potential savings opportunities.
 */
export const OPTIMIZATION_RULES = [
  {
    id: 'rule-openai-downgrade',
    provider: 'openai',
    category: 'model-downgrade',
    title: 'Migrate legacy GPT-4 to GPT-4o-mini',
    description: 'Analyze context size and downgrade non-reasoning tasks. GPT-4o-mini is 80% cheaper with comparable benchmark accuracy.',
    estimatedSavingsPercent: 80,
    impact: 'high',
  },
  {
    id: 'rule-anthropic-caching',
    provider: 'anthropic',
    category: 'prompt-caching',
    title: 'Enable Prompt Caching on Claude Sonnet',
    description: 'For system instructions or documents > 1024 tokens, leverage prompt caching to save up to 90% on input token costs.',
    estimatedSavingsPercent: 90,
    impact: 'high',
  },
  {
    id: 'rule-unused-keys',
    provider: 'all',
    category: 'unused-key',
    title: 'Deactivate zero-request API keys',
    description: 'Identify API keys that have not recorded any request in the past 30 days but carry monthly baseline fees or pose security risks.',
    estimatedSavingsPercent: 100,
    impact: 'medium',
  },
  {
    id: 'rule-context-pruning',
    provider: 'all',
    category: 'context-optimization',
    title: 'Trim redundant metadata in prompt histories',
    description: 'Prune trailing system messages and excessive conversation logs. Save an average of 15% on cumulative input volumes.',
    estimatedSavingsPercent: 15,
    impact: 'low',
  },
];
