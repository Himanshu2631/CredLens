import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please provide a company name.'],
      trim: true,
      maxlength: [100, 'Company name cannot be more than 100 characters'],
    },
    contactName: {
      type: String,
      required: [true, 'Please provide a contact name.'],
      trim: true,
      maxlength: [100, 'Contact name cannot be more than 100 characters'],
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
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot be more than 20 characters'],
      default: '',
    },
    activeSpend: {
      type: Number,
      default: 0,
      min: [0, 'Active spend cannot be negative'],
    },
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
