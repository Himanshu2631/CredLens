import { GeminiProvider } from './gemini.js';
import { AnthropicProvider } from './anthropic.js';
import { MockProvider } from './mock.js';

// Instantiate registered providers
const PROVIDER_REGISTRY = {
  gemini: new GeminiProvider(),
  anthropic: new AnthropicProvider(),
  mock: new MockProvider()
};

/**
 * Retrieves the requested provider strategy instance.
 * Falls back gracefully to MockProvider if unknown or invalid.
 * 
 * @param {string} name Provider name (e.g. 'gemini', 'anthropic', 'mock')
 * @returns {import('./base.js').BaseProvider} The instantiated strategy object
 */
export function getProvider(name) {
  const normalized = name?.toLowerCase().trim();
  const provider = PROVIDER_REGISTRY[normalized];
  if (!provider) {
    console.warn(`[AI Providers] Provider "${name}" is not registered. Defaulting to offline mock.`);
    return PROVIDER_REGISTRY.mock;
  }
  return provider;
}
