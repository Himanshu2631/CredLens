import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  provider: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  estimatedImpact: { type: String, required: true },
  estimatedSavings: {
    monthly: { type: Number, required: true },
    yearly: { type: Number, required: true },
    formattedMonthly: { type: String, required: true },
    formattedYearly: { type: String, required: true },
    logic: { type: String, default: '' }
  },
  actionableSteps: [{ type: String }],
  priority: { type: String, required: true },
  estimatedMonthlySavings: { type: Number, required: true },
  estimatedYearlySavings: { type: Number, required: true },
  optimizedMonthlyCost: { type: Number, required: true },
  currentMonthlyCost: { type: Number, required: true },
  savingsLogic: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const AuditSchema = new mongoose.Schema(
  {
    // Input parameters
    projectName: {
      type: String,
      required: [true, 'Please provide a project or startup name.'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters'],
    },
    tools: {
      type: [String],
      default: [],
    },
    toolPlans: {
      type: Map,
      of: String,
      default: {},
    },
    seats: {
      type: Number,
      required: true,
      min: [1, 'Seats must be at least 1'],
    },
    inactiveSeats: {
      type: Number,
      default: 0,
      min: [0, 'Inactive seats cannot be negative'],
    },
    monthlySpend: {
      type: Number,
      required: true,
      min: [0, 'Monthly spend cannot be negative'],
    },
    useCase: {
      type: String,
      required: true,
    },
    optimizationGoal: {
      type: String,
      required: true,
    },
    
    // Output calculations & audit results
    summary: {
      totalCurrentSpend: { type: Number, required: true },
      optimizedSpendEstimate: { type: Number, required: true },
      totalEstimatedSavings: { type: Number, required: true },
      totalEstimatedYearlySavings: { type: Number, required: true },
      formattedCurrentSpend: { type: String, required: true },
      formattedOptimizedSpend: { type: String, required: true },
      formattedEstimatedSavings: { type: String, required: true },
      formattedEstimatedYearlySavings: { type: String, required: true },
      runwayRestoredPercent: { type: Number, required: true },
      subscriptionCost: { type: Number, required: true },
      apiSpend: { type: Number, required: true },
      apiAllocation: {
        type: Map,
        of: Number,
        default: {},
      },
      
      // Backward Compatibility summary fields
      totalPotentialSavings: { type: Number, required: true },
      optimizedMonthlySpend: { type: Number, required: true },
      totalPotentialYearlySavings: { type: Number, required: true },
      currentMonthlySpend: { type: Number, required: true }
    },
    recommendations: [RecommendationSchema],
    recommendationExplanations: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

// Prevents compilation error if model already exists during hot reload
export default mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
