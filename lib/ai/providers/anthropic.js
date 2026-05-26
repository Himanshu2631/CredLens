import { BaseProvider } from './base.js';
import { SYSTEM_PROMPT } from '../prompts.js';
import { extractJSON } from '../utils.js';
import { AI_CONFIG } from '../config.js';

/**
 * Anthropic Messages API Provider implementation.
 */
export class AnthropicProvider extends BaseProvider {
  constructor() {
    super('anthropic');
  }

  /**
   * Generates summary response using Anthropic Messages API.
   * 
   * @param {string} apiKey Provider API credential key
   * @param {Object} auditData Form inputs, calculations, and recommendations
   * @param {string} userPrompt Compiled prompt context text
   * @returns {Promise<Object>} Output fields mapping matching the schema
   */
  async generateSummary(apiKey, auditData, userPrompt) {
    const targetModel = AI_CONFIG.defaultModel.anthropic;
    console.log(`[Anthropic Provider] Target Model: "${targetModel}"`);
    console.log('[Anthropic Provider] Dispatching HTTP request to Anthropic Messages API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: targetModel,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error('Anthropic returned an empty message response.');
    }

    console.log(`[Anthropic Provider] Received response content from Anthropic API (Length: ${content.length} chars).`);
    const parsedJSON = extractJSON(content);

    const summaryText = parsedJSON.ai_audit_summary || parsedJSON.executiveSummary || '';

    return {
      ai_audit_summary: summaryText,
      executiveSummary: summaryText,
      keyInsights: Array.isArray(parsedJSON.keyInsights) ? parsedJSON.keyInsights : [],
      runwayImpact: parsedJSON.runwayImpact || '',
      provider: 'anthropic',
      generatedAt: new Date()
    };
  }
}
