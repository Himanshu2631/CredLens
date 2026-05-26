/**
 * Prompts & Grounding instructions for CredLens AI Spend Optimization SaaS Platform.
 */

export const SYSTEM_PROMPT = `
You are a Principal Startup Financial Architect and AI Cloud Economist. 
Your goal is to summarize AI spend audit findings and recommendations for startup founders and operators.

You MUST follow these rules:
1. **JSON Output**: You MUST respond with a single, valid JSON object and nothing else. Do not include markdown formatting like \`\`\`json ... \`\`\` or other wrapper text.
2. **JSON Schema**: The JSON object must match this schema:
   {
     "ai_audit_summary": "A concise, single-paragraph financial summary of the audit. Keep it extremely brief and follow this exact template structure: 'Our financial audit identified [Savings]/mo in monthly optimization opportunities across the [projectName] AI stack. Addressing these redundancies decreases your recurring baseline from [CurrentSpend]/mo to [OptimizedSpend]/mo, reclaiming [runwayRestoredPercent]% of active AI operating overhead.' Avoid extra explanations or conversational fillers.",
     "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
     "runwayImpact": "A single, professional sentence outlining how the saved capital extends cash runway or improves engineering efficiency."
   }
3. **No Hallucinations**: You MUST remain strictly grounded in the provided calculation data and recommendations.
   - Do NOT invent or estimate new savings numbers. Only use the numbers provided in the input.
   - Do NOT mention tools, plans, or categories that were not part of the input.
   - All insights and comments must correspond directly to the calculated metrics or recommendation reasons.
4. **Style Guidelines**:
   - **Extreme Conciseness**: The 'ai_audit_summary' MUST be only 1-2 sentences. Directly report the numbers using the template style specified.
   - Keep the tone professional, objective, concise, and financially believable.
   - Avoid generic AI buzzword spam (e.g., "revolutionize", "game-changing", "drastically", "cutting-edge", "substantial redundancies").
   - Avoid overexplaining findings or writing long analytical paragraphs.
   - Do NOT make exaggerated or generic claims. Refer to actual tools and amounts (e.g., "Consolidating duplicate chat workspaces yields $80/mo").
   - Ensure the 'keyInsights' array contains exactly 3 highly specific, actionable observations.
`;

/**
 * Builds the user prompt detailing the audit inputs, rules engine math, and recommendation items.
 * 
 * @param {Object} auditData
 * @returns {string} User prompt context
 */
export function buildUserPrompt(auditData) {
  const {
    projectName,
    seats,
    monthlySpend,
    useCase,
    optimizationGoal,
    summary = {},
    recommendations = []
  } = auditData || {};

  const safeSummary = summary || {};
  const recs = Array.isArray(recommendations) ? recommendations : [];

  const recommendationsList = recs.map((rec, index) => {
    return `${index + 1}. [${rec.title}]
   - Category: ${rec.category}
   - Priority: ${rec.priority || rec.estimatedImpact}
   - Action: ${rec.explanation}
   - Why: ${rec.whyItMatters}
   - Monthly Savings: ${rec.estimatedSavings?.formattedMonthly || `$${rec.estimatedMonthlySavings}/mo`}
   - Yearly Savings: ${rec.estimatedSavings?.formattedYearly || `$${rec.estimatedYearlySavings}/yr`}`;
  }).join('\n\n');

  return `
Analyze the following startup AI Spend Audit and output the structured JSON summary.

=== STARTUP CONTEXT ===
- Startup/Project Name: ${projectName || 'Startup'}
- Team Seats Count: ${seats || 1}
- Use Case: ${useCase || 'General'}
- Primary Optimization Goal: ${optimizationGoal || 'Reduce general AI overhead'}

=== FINANCIAL CALCULATIONS ===
- Current Monthly AI Spend: ${safeSummary.formattedCurrentSpend || `$${safeSummary.totalCurrentSpend || 0}/mo`}
- Optimized Monthly AI Spend: ${safeSummary.formattedOptimizedSpend || `$${safeSummary.optimizedSpendEstimate || 0}/mo`}
- Total Estimated Monthly Savings: ${safeSummary.formattedEstimatedSavings || `$${safeSummary.totalEstimatedSavings || 0}/mo`}
- Total Estimated Yearly Savings: ${safeSummary.formattedEstimatedYearlySavings || `$${safeSummary.totalEstimatedYearlySavings || 0}/yr`}
- Overhead Spend Reduced: ${safeSummary.runwayRestoredPercent || 0}%
- Baseline Subscriptions: $${safeSummary.subscriptionCost || 0}/mo
- Volumetric API Spend: $${safeSummary.apiSpend || 0}/mo

=== RECOMMENDATIONS LIST ===
${recs.length > 0 ? recommendationsList : 'No specific recommendations triggered. The stack is already fully optimized.'}

Remember: Output ONLY valid JSON matching the specified schema. Ground all numbers and statements strictly in the data above.
`;
}
