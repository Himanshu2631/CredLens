import mongoose from 'mongoose';

const AuditSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, 'Please provide a project or startup name.'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters'],
    },
    monthlyBudget: {
      type: Number,
      default: 0,
    },
    primaryProvider: {
      type: String,
      enum: ['all', 'openai', 'anthropic', 'other'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    fileName: {
      type: String,
    },
    summary: {
      totalSpend: { type: Number, default: 0 },
      projectedSpend: { type: Number, default: 0 },
      potentialSavings: { type: Number, default: 0 },
    },
    suggestions: [
      {
        provider: String,
        category: String, // 'model-downgrade', 'unused-key', 'rate-limit-tweak', 'unsupported-tier'
        title: String,
        description: String,
        estimatedSavings: Number,
        impact: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevents compilation error if model already exists during hot reload
export default mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
