import * as z from 'zod';

// Step 1 Schema: Tool Selection & Plans
export const toolSelectionSchema = z.object({
  tools: z.array(z.string()).min(1, { message: 'Please select at least one AI tool to audit.' }),
  toolPlans: z.record(z.string(), z.string()).refine((val) => {
    return true; // Pre-populated defaults guarantee mapping completeness
  }),
});

// Step 2 Schema: Spend and Seat Metrics
export const spendMetricsSchema = z.object({
  monthlySpend: z.coerce
    .number({ invalid_type_error: 'Monthly spend must be a valid number.' })
    .min(10, { message: 'Monthly spend must be at least $10 for a cost assessment.' })
    .max(10000000, { message: 'Monthly spend cannot exceed $10,000,000.' }),
  seats: z.coerce
    .number({ invalid_type_error: 'Seats count must be a number.' })
    .int({ message: 'Seats must be a whole number.' })
    .min(1, { message: 'Please specify at least 1 user license/seat.' })
    .max(10000, { message: 'Seats count cannot exceed 10,000.' }),
});

// Step 3 Schema: Use-case Selection and Goals
export const useCaseSchema = z.object({
  useCase: z.enum(['coding', 'writing', 'research', 'data_analysis', 'mixed_usage'], {
    errorMap: () => ({ message: 'Please select a primary workload use-case.' }),
  }),
  optimizationGoal: z
    .string()
    .max(200, { message: 'Goal description must be under 200 characters.' })
    .optional()
    .or(z.literal('')),
});

// Merged Form Schema (consolidated view)
export const spendAuditFormSchema = z.object({
  ...toolSelectionSchema.shape,
  ...spendMetricsSchema.shape,
  ...useCaseSchema.shape,
});
