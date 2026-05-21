import mongoose from 'mongoose';

const UsageSchema = new mongoose.Schema(
  {
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['openai', 'anthropic', 'cohere', 'google', 'other'],
    },
    modelName: {
      type: String,
      required: true, // e.g. 'gpt-4o', 'claude-3-5-sonnet'
      trim: true,
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    costUSD: {
      type: Number,
      required: true,
      default: 0,
    },
    dateRecorded: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Usage || mongoose.model('Usage', UsageSchema);
