import mongoose from 'mongoose';

const BetaRequestSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide a company name.'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a contact email address.'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address.',
      ],
    },
    teamSize: {
      type: Number,
      min: [1, 'Team size must be at least 1 user.'],
      default: null,
    },
    featureKey: {
      type: String,
      required: true,
      default: 'subscription_hub',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'contacted'],
      default: 'pending',
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compilation error if model already exists during hot reload
export default mongoose.models.BetaRequest || mongoose.model('BetaRequest', BetaRequestSchema);
