/**
 * OpenAI Chat Completion API integration.
 * Triggers standard POST fetch calls to request structured JSON.
 */

export async function generateOpenAISummary(apiKey, auditData) {
  const { SYSTEM_PROMPT, buildUserPrompt } = await import('../prompts.js');
  const userPrompt = buildUserPrompt(auditData);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API request failed: ${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('OpenAI returned an empty choice response.');
  }

  const parsed = JSON.parse(content.trim());
  
  return {
    executiveSummary: parsed.executiveSummary || '',
    keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
    runwayImpact: parsed.runwayImpact || '',
    provider: 'openai',
    generatedAt: new Date()
  };
}
