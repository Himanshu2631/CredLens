/**
 * Centralized AI settings, default models, and environment credential validation.
 */

export const AI_CONFIG = {
  activeProvider: (process.env.AI_PROVIDER || '').toLowerCase().trim(),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultModel: {
    gemini: 'gemini-2.5-flash',
    anthropic: 'claude-3-5-haiku-20241022'
  }
};

/**
 * Validates the environment credentials for a specific provider.
 * 
 * @param {string} providerName 
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export function validateProviderEnv(providerName) {
  if (providerName === 'gemini') {
    if (!AI_CONFIG.geminiApiKey) {
      return { isValid: false, error: 'GEMINI_API_KEY is not defined in .env.local.' };
    }
  } else if (providerName === 'anthropic') {
    if (!AI_CONFIG.anthropicApiKey) {
      return { isValid: false, error: 'ANTHROPIC_API_KEY is not defined in .env.local.' };
    }
  } else if (providerName === 'mock') {
    return { isValid: true };
  } else {
    return { isValid: false, error: `Unknown provider: ${providerName}` };
  }
  return { isValid: true };
}
