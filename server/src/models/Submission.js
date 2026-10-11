import mongoose from 'mongoose';

// "Maqola yuborish" — article submissions from authors
const submissionSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    workplace: { type: String, default: '' },
    degree: { type: String, default: '' },
    orcid: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    rubric: { type: String, default: '' },
    annotation: { type: String, default: '' },
    keywords: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { type: String, enum: ['new', 'review', 'accepted', 'rejected'], default: 'new' }
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
