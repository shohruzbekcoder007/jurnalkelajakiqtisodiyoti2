import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    wpId: { type: Number, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    date: { type: Date, default: Date.now, index: true },
    modified: { type: Date, default: Date.now },
    status: { type: String, enum: ['publish', 'draft'], default: 'publish', index: true },
    author: { type: String, default: 'fintex-admin' },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true }],
    thumbnail: { type: String, default: '' },
    commentCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

export default mongoose.model('Post', postSchema);
