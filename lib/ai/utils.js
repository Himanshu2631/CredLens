/**
 * Reusable utility helper functions for response parsing, schema validation/repair, and timing instrumentation.
 */

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
    // Continue
  }

  // 2. Extract from markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // 3. Extract substring between first '{' and last '}'
  const startIdx = trimmed.indexOf('{');
  const endIdx = trimmed.lastIndexOf('}');
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    try {
      return JSON.parse(trimmed.substring(startIdx, endIdx + 1));
    } catch (e) {
      // Continue
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

  // Ensure keyInsights is an array of strings
  if (parsed && Array.isArray(parsed.keyInsights) && parsed.keyInsights.length > 0) {
    result.keyInsights = parsed.keyInsights.map(item => String(item).trim()).slice(0, 3);
  }

  // If we ended up with fewer than 3 insights, backfill using fallback insights
  while (result.keyInsights.length < 3) {
    const fallbackInsight = fallbackData.keyInsights[result.keyInsights.length] || fallbackData.keyInsights[0];
    result.keyInsights.push(fallbackInsight);
  }

  return result;
}

/**
 * Runs an async task and measures its duration.
 * 
 * @param {Function} taskAsync 
 * @returns {Promise<{result: any, durationMs: number}>} Task output and duration
 */
export async function measureTiming(taskAsync) {
  const start = performance.now();
  const result = await taskAsync();
  const end = performance.now();
  return {
    result,
    durationMs: Math.round(end - start)
  };
}
