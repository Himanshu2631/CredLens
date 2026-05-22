import * as z from 'zod';

// Step 1 Schema: Tool Selection
export const toolSelectionSchema = z.object({
  tools: z.array(z.string()).min(1, { message: 'Please select at least one AI tool to audit.' }),
});

// Step 2 Schema: Spend and Team Metrics
export const spendMetricsSchema = z.object({
  plan: z.enum(['pay_as_you_go', 'fixed_subscription', 'custom_enterprise'], {
    errorMap: () => ({ message: 'Please select a pricing model.' }),
  }),
  monthlySpend: z.coerce
    .number({ invalid_type_error: 'Monthly spend must be a number.' })
    .min(100, { message: 'Spend must be at least $100 for an audit.' })
    .max(10000000, { message: 'Spend cannot exceed $10,000,000.' }),
  teamSize: z.enum(['1-5', '6-20', '21-50', '50+'], {
    errorMap: () => ({ message: 'Please select your team size.' }),
  }),
});

// Step 3 Schema: Use-case Selection and Goals
export const useCaseSchema = z.object({
  useCase: z.enum(['production_llms', 'prototyping_rd', 'agentic_workflows', 'image_media', 'customer_support'], {
    errorMap: () => ({ message: 'Please select a primary use-case.' }),
  }),
  optimizationGoal: z
    .string()
    .max(200, { message: 'Optimization goal description must be under 200 characters.' })
    .optional()
    .or(z.literal('')), // Handles empty strings smoothly
});

// Merged Form Schema (consolidated view)
export const spendAuditFormSchema = z.object({
  ...toolSelectionSchema.shape,
  ...spendMetricsSchema.shape,
  ...useCaseSchema.shape,
});
