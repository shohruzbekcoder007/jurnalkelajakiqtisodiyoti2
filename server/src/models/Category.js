import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    wpId: { type: Number, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: '' },
    parent: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
