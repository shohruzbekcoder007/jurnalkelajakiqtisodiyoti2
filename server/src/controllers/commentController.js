import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { asyncHandler } from '../utils/helpers.js';

// GET /api/comments/post/:slug
export const listByPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).select('_id').lean();
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }
  const comments = await Comment.find({ post: post._id, approved: true })
    .sort({ date: 1 })
    .lean();
  res.json({ comments });
});

// POST /api/comments
export const createComment = asyncHandler(async (req, res) => {
  const { slug, author, email, website = '', content } = req.body;
  if (!slug || !author || !email || !content) {
    res.status(400);
    throw new Error('Ism, e-mail va izoh matni majburiy');
  }
  const post = await Post.findOne({ slug }).select('_id').lean();
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }
  await Comment.create({ post: post._id, author, email, website, content });
  res.status(201).json({
    message: 'Izohingiz qabul qilindi va moderatsiya kutmoqda.'
  });
});

/* --------------------------------- admin --------------------------------- */

export const adminListComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find()
    .populate('post', 'title slug')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ comments });
});

export const approveComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Izoh topilmadi');
  }
  comment.approved = !comment.approved;
  await comment.save();
  const count = await Comment.countDocuments({ post: comment.post, approved: true });
  await Post.updateOne({ _id: comment.post }, { commentCount: count });
  res.json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error('Izoh topilmadi');
  }
  const count = await Comment.countDocuments({ post: comment.post, approved: true });
  await Post.updateOne({ _id: comment.post }, { commentCount: count });
  res.json({ message: 'Izoh ochirildi', id: req.params.id });
});
