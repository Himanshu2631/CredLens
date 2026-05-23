/**
 * Base AI Provider Strategy Contract.
 * All backend model client wrappers inherit from this strategy class.
 */
export class BaseProvider {
  /**
   * @param {string} name Provider name (e.g. 'gemini', 'anthropic', 'mock')
   */
  constructor(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('[BaseProvider] Provider must have a valid name.');
    }
    this.name = name;
  }

  /**
   * Generates summary response using the model API.
   * Must be overridden by strategy implementations.
   * 
   * @param {string} apiKey Provider API credential key
   * @param {Object} auditData Form inputs, calculations, and recommendations
   * @param {string} userPrompt Compiled prompt context text
   * @returns {Promise<Object>} Output fields mapping matching the schema
   */
  async generateSummary(apiKey, auditData, userPrompt) {
    throw new Error(`generateSummary() not implemented for provider "${this.name}".`);
  }
}
