/**
 * Unified AI Service Orchestration Facade for AI Spend Audit.
 */

import { AI_CONFIG, validateProviderEnv } from './config.js';
import { buildUserPrompt } from './prompts.js';
import { getProvider } from './providers/index.js';
import { generateMockSummary } from './providers/mock.js';
import { validateAndRepairSummary, measureTiming } from './utils.js';

// Re-export key parsing/repair helper utilities for unit test suite compatibility
export { extractJSON, validateAndRepairSummary } from './utils.js';

/**
 * Orchestrates AI audit summary generation based on environment credentials.
 * Automatically handles provider auto-detection, timing telemetry instrumentation,
 * and seamless fallback routing to local mock generator on any downstream errors.
 * 
 * @param {Object} auditData Context data (inputs, calculations, recommendations)
 * @returns {Promise<Object>} Persistable aiSummary object
 */
export async function generateAuditSummary(auditData) {
  const mockFallback = generateMockSummary(auditData);
  
  // 1. Determine active provider strategy
  let activeProvider = 'mock';
  const configProvider = AI_CONFIG.activeProvider;
  
  if (configProvider === 'gemini') {
    activeProvider = 'gemini';
  } else if (configProvider === 'anthropic') {
    activeProvider = 'anthropic';
  } else if (configProvider === 'mock') {
    activeProvider = 'mock';
  } else {
    // Auto-detect based on available keys in the server environment
    if (AI_CONFIG.geminiApiKey) {
      activeProvider = 'gemini';
    } else if (AI_CONFIG.anthropicApiKey) {
      activeProvider = 'anthropic';
    }
  }

  // 2. Validate environment credentials for the chosen provider
  const envCheck = validateProviderEnv(activeProvider);
  if (!envCheck.isValid) {
    console.warn(`[AI Service] Active provider "${activeProvider}" has invalid environment: ${envCheck.error}. Falling back to mock.`);
    return {
      ...mockFallback,
      debugError: `Invalid environment: ${envCheck.error}`,
      debugProvider: activeProvider
    };
  }

  console.log(`[AI Service] Routing request to provider: "${activeProvider}" (Configured override: "${configProvider || 'none'}")`);

  if (activeProvider === 'mock') {
    return mockFallback;
  }

  try {
    // 3. Construct the prompt context
    const userPrompt = buildUserPrompt(auditData);
    
    // 4. Resolve provider strategy
    const providerInstance = getProvider(activeProvider);
    const apiKey = activeProvider === 'gemini' ? AI_CONFIG.geminiApiKey : AI_CONFIG.anthropicApiKey;

    // 5. Measure latency and execute request
    const { result: response, durationMs } = await measureTiming(() =>
      providerInstance.generateSummary(apiKey, auditData, userPrompt)
    );

    console.log(`[AI Service] Live AI summary generated successfully on provider "${activeProvider}" in ${durationMs}ms.`);
    
    // 6. Validate and repair response schema
    return validateAndRepairSummary(response, mockFallback);
  } catch (error) {
    console.error(`[AI Service] Live summary generation failed on provider "${activeProvider}":`, error.message);
    console.log('[AI Service] Falling back to high-fidelity offline mock summary builder.');
    return {
      ...mockFallback,
      debugError: error.message || String(error),
      debugProvider: activeProvider
    };
  }
}
