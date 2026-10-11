import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    wpId: { type: Number, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    menuOrder: { type: Number, default: 0 },
    showInMenu: { type: Boolean, default: true },
    status: { type: String, enum: ['publish', 'draft'], default: 'publish' }
  },
  { timestamps: true }
);

export default mongoose.model('Page', pageSchema);
