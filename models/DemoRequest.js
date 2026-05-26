import mongoose from 'mongoose';

const DemoRequestSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      required: [true, 'Please provide a full name.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide a business email address.'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address.',
      ],
    },
    companyName: {
      type: String,
      required: [true, 'Please provide a company name.'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters.'],
    },
    useCase: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters.'],
      default: '',
    },
    teamSize: {
      type: Number,
      min: [1, 'Team size must be at least 1.'],
      default: null,
    },
    monthlySpend: {
      type: Number,
      min: [0, 'Estimated monthly spend cannot be negative.'],
      default: null,
    },
    providers: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'canceled'],
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
export default mongoose.models.DemoRequest || mongoose.model('DemoRequest', DemoRequestSchema);
