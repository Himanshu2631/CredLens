import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name.'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your contact email.'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address.',
      ],
    },
    message: {
      type: String,
      required: [true, 'Please provide your feedback message.'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters.'],
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
export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
