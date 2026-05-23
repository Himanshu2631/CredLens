/**
 * Anthropic Messages API integration.
 * Triggers standard POST fetch calls with Anthropic headers to request summaries.
 */

export async function generateAnthropicSummary(apiKey, auditData) {
  const { SYSTEM_PROMPT, buildUserPrompt } = await import('../prompts.js');
  const userPrompt = buildUserPrompt(auditData);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
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

  // The content parsing (extracting JSON) is handled by the shared aiService utility
  return {
    rawContent: content,
    provider: 'anthropic',
    generatedAt: new Date()
  };
}
