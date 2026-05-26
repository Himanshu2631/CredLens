import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseProvider } from './base.js';
import { SYSTEM_PROMPT } from '../prompts.js';
import { AI_CONFIG } from '../config.js';

/**
 * Google Gemini API Provider implementation.
 */
export class GeminiProvider extends BaseProvider {
  constructor() {
    super('gemini');
  }

  /**
   * Generates summary response using Gemini model API.
   * 
   * @param {string} apiKey Provider API credential key
   * @param {Object} auditData Form inputs, calculations, and recommendations
   * @param {string} userPrompt Compiled prompt context text
   * @returns {Promise<Object>} Output fields mapping matching the schema
   */
  async generateSummary(apiKey, auditData, userPrompt) {
    console.log('[Gemini Provider] Initializing GoogleGenerativeAI client with provided API key...');
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const targetModel = AI_CONFIG.defaultModel.gemini;
    console.log(`[Gemini Provider] Target Model: "${targetModel}"`);
    console.log(`[Gemini Provider] User prompt length: ${userPrompt.length} characters.`);
    console.log(`[Gemini Provider] User prompt preview:\n--- PROMPT PREVIEW ---\n${userPrompt.trim().substring(0, 300)}...\n--- END PREVIEW ---`);

    const model = genAI.getGenerativeModel({
      model: targetModel,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    console.log('[Gemini Provider] Dispatching generateContent request to Gemini API...');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    });
    
    const response = await result.response;
    const content = response.text();

    console.log(`[Gemini Provider] Received response content from Gemini API (Length: ${content ? content.length : 0} chars).`);
    console.log(`[Gemini Provider] Raw response body:\n${content}`);

    if (!content) {
      throw new Error('Google Gemini API returned an empty response.');
    }

    const parsed = JSON.parse(content.trim());

    const summaryText = parsed.ai_audit_summary || parsed.executiveSummary || '';

    return {
      ai_audit_summary: summaryText,
      executiveSummary: summaryText,
      keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
      runwayImpact: parsed.runwayImpact || '',
      provider: 'gemini',
      generatedAt: new Date()
    };
  }
}
