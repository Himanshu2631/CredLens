/**
 * AI Service Orchestrator for AI Spend Audit Summaries.
 */

import { generateMockSummary } from './providers/mock.js';
import { generateOpenAISummary } from './providers/openai.js';
import { generateAnthropicSummary } from './providers/anthropic.js';

/**
 * Extracts and parses a JSON object from text returned by LLMs.
 * Handles direct parsing, markdown code fences, and curly-brace substring slicing.
 * 
 * @param {string} text 
 * @returns {Object} Parsed JSON object
 */
export function extractJSON(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a valid non-empty string.');
  }

  const trimmed = text.trim();
  
  // 1. Try direct parsing
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Continue to next extraction method
  }

  // 2. Extract from markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) {
      // Continue to next extraction method
    }
  }

  // 3. Extract substring between first '{' and last '}'
  const startIdx = trimmed.indexOf('{');
  const endIdx = trimmed.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    try {
      return JSON.parse(trimmed.substring(startIdx, endIdx + 1));
    } catch (e) {
      // Continue to next extraction method
    }
  }

  throw new Error('LLM output could not be parsed as a valid JSON object.');
}

/**
 * Validates and repairs the fields in an AI summary payload.
 * Ensures the output strictly conforms to the expected structure.
 * 
 * @param {Object} parsed JSON payload
 * @param {Object} fallbackData Default values to repair missing keys
 * @returns {Object} Validated summary object
 */
export function validateAndRepairSummary(parsed, fallbackData) {
  const result = {
    executiveSummary: parsed?.executiveSummary || fallbackData.executiveSummary || '',
    keyInsights: [],
    runwayImpact: parsed?.runwayImpact || fallbackData.runwayImpact || '',
    provider: parsed?.provider || 'mock',
    generatedAt: parsed?.generatedAt || new Date()
  };

  // Ensure keyInsights is an array of exactly 3 strings
  if (parsed && Array.isArray(parsed.keyInsights) && parsed.keyInsights.length > 0) {
    result.keyInsights = parsed.keyInsights.map(item => String(item).trim()).slice(0, 3);
  }

  // If we ended up with fewer than 3 insights, backfill using mock insights
  while (result.keyInsights.length < 3) {
    const fallbackInsight = fallbackData.keyInsights[result.keyInsights.length] || fallbackData.keyInsights[0];
    result.keyInsights.push(fallbackInsight);
  }

  return result;
}

/**
 * Orchestrates AI audit summary generation based on environment credentials and configuration.
 * Automatically falls back to high-fidelity mock summaries on failures or missing keys.
 * 
 * @param {Object} auditData Context data (inputs, calculations, recommendations)
 * @returns {Promise<Object>} Persistable aiSummary object
 */
export async function generateAuditSummary(auditData) {
  const mockFallback = generateMockSummary(auditData);
  
  const providerConfig = (process.env.AI_PROVIDER || 'mock').toLowerCase().trim();
  const openAIKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    if (providerConfig === 'openai' && openAIKey) {
      console.log('[AI Service] Dispatching request to OpenAI (gpt-4o-mini)...');
      const response = await generateOpenAISummary(openAIKey, auditData);
      return validateAndRepairSummary({ ...response, provider: 'openai' }, mockFallback);
    } 
    
    if (providerConfig === 'anthropic' && anthropicKey) {
      console.log('[AI Service] Dispatching request to Anthropic (claude-3-5-haiku)...');
      const response = await generateAnthropicSummary(anthropicKey, auditData);
      const parsedJSON = extractJSON(response.rawContent);
      return validateAndRepairSummary({ ...parsedJSON, provider: 'anthropic' }, mockFallback);
    }

    // Default or fallback to local Mock provider
    console.log('[AI Service] Using offline high-fidelity mock summary builder.');
    return mockFallback;
  } catch (error) {
    console.warn('[AI Service] Live AI summary generation failed. Reverting to local mock:', error.message);
    return mockFallback;
  }
}
