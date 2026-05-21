import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
    },
    providerName: {
      type: String,
      required: [true, 'Please provide the provider name (e.g., OpenAI, Anthropic, Midjourney).'],
      trim: true,
    },
    serviceTier: {
      type: String,
      required: [true, 'Please specify the service tier or plan.'],
      trim: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'one-time'],
      default: 'monthly',
    },
    costPerSeat: {
      type: Number,
      default: 0,
    },
    seatsCount: {
      type: Number,
      default: 1,
    },
    totalMonthlyCost: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
