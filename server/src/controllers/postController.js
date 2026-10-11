import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Category from '../models/Category.js';
import { asyncHandler, parsePaging, uniqueSlug, buildExcerpt } from '../utils/helpers.js';

const LIST_FIELDS = 'wpId title slug excerpt date author categories thumbnail commentCount';

function dateRangeFilter({ year, month, day }) {
  if (!year) return null;
  const y = parseInt(year, 10);
  const m = month ? parseInt(month, 10) : null;
  const d = day ? parseInt(day, 10) : null;
  let start;
  let end;
  if (d && m) {
    start = new Date(y, m - 1, d);
    end = new Date(y, m - 1, d + 1);
  } else if (m) {
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 1);
  } else {
    start = new Date(y, 0, 1);
    end = new Date(y + 1, 0, 1);
  }
  return { $gte: start, $lt: end };
}

// GET /api/posts
export const listPosts = asyncHandler(async (req, res) => {
  const { page, perPage, skip } = parsePaging(req.query, 10);
  const filter = { status: 'publish' };

  if (req.query.category) {
    const cat = await Category.findOne({ slug: req.query.category }).lean();
    if (!cat) return res.json({ posts: [], total: 0, totalPages: 0, page, perPage });
    filter.categories = cat._id;
  }
  if (req.query.author) filter.author = req.query.author;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { content: rx }, { excerpt: rx }];
  }
  const range = dateRangeFilter(req.query);
  if (range) filter.date = range;

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select(LIST_FIELDS)
      .populate('categories', 'name slug')
      .sort({ date: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Post.countDocuments(filter)
  ]);

  res.json({ posts, total, totalPages: Math.ceil(total / perPage), page, perPage });
});

// GET /api/posts/featured  -> home page slider
export const featuredPosts = asyncHandler(async (req, res) => {
  const limit = Math.min(30, parseInt(req.query.limit, 10) || 17);
  const posts = await Post.find({ status: 'publish' })
    .select(LIST_FIELDS)
    .populate('categories', 'name slug')
    .sort({ date: -1 })
    .limit(limit)
    .lean();
  res.json({ posts });
});

// GET /api/posts/archive/calendar?year=&month=
export const calendar = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = parseInt(req.query.year, 10) || now.getFullYear();
  const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const rows = await Post.find({ status: 'publish', date: { $gte: start, $lt: end } })
    .select('date')
    .lean();
  const days = [...new Set(rows.map((r) => new Date(r.date).getDate()))].sort((a, b) => a - b);

  const [older, newer] = await Promise.all([
    Post.findOne({ status: 'publish', date: { $lt: start } }).select('date').sort({ date: -1 }).lean(),
    Post.findOne({ status: 'publish', date: { $gte: end } }).select('date').sort({ date: 1 }).lean()
  ]);

  res.json({
    year,
    month,
    days,
    prev: older
      ? { year: new Date(older.date).getFullYear(), month: new Date(older.date).getMonth() + 1 }
      : null,
    next: newer
      ? { year: new Date(newer.date).getFullYear(), month: new Date(newer.date).getMonth() + 1 }
      : null
  });
});

// GET /api/posts/archive/months
export const archiveMonths = asyncHandler(async (req, res) => {
  const rows = await Post.aggregate([
    { $match: { status: 'publish' } },
    { $group: { _id: { y: { $year: '$date' }, m: { $month: '$date' } }, count: { $sum: 1 } } },
    { $sort: { '_id.y': -1, '_id.m': -1 } }
  ]);
  res.json({ months: rows.map((r) => ({ year: r._id.y, month: r._id.m, count: r.count })) });
});

// GET /api/posts/:slug
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, status: 'publish' })
    .populate('categories', 'name slug')
    .lean();
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }

  const [prev, next, related] = await Promise.all([
    Post.findOne({ status: 'publish', date: { $lt: post.date } })
      .select('title slug')
      .sort({ date: -1 })
      .lean(),
    Post.findOne({ status: 'publish', date: { $gt: post.date } })
      .select('title slug')
      .sort({ date: 1 })
      .lean(),
    Post.find({
      status: 'publish',
      _id: { $ne: post._id },
      categories: { $in: (post.categories || []).map((c) => c._id) }
    })
      .select(LIST_FIELDS)
      .populate('categories', 'name slug')
      .sort({ date: -1 })
      .limit(3)
      .lean()
  ]);

  Post.updateOne({ _id: post._id }, { $inc: { views: 1 } }).catch(() => {});

  res.json({ post, prev, next, related });
});

/* ------------------------------- admin CRUD ------------------------------- */

// GET /api/posts/admin/all — drafts included
export const adminListPosts = asyncHandler(async (req, res) => {
  const { page, perPage, skip } = parsePaging(req.query, 20);
  const filter = {};
  if (req.query.search) filter.title = new RegExp(req.query.search, 'i');
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('title slug status date categories')
      .populate('categories', 'name slug')
      .sort({ date: -1 })
      .skip(skip)
      .limit(perPage)
      .lean(),
    Post.countDocuments(filter)
  ]);
  res.json({ posts, total, totalPages: Math.ceil(total / perPage), page, perPage });
});

// GET /api/posts/admin/one/:id — full document for the editor
export const adminGetPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('categories', 'name slug').lean();
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }
  res.json({ post });
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, excerpt, categories = [], status = 'publish', date } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Sarlavha majburiy');
  }
  const post = await Post.create({
    title,
    slug: await uniqueSlug(Post, req.body.slug || title),
    content: content || '',
    excerpt: excerpt || buildExcerpt(content),
    categories: categories.filter((c) => mongoose.isValidObjectId(c)),
    status,
    date: date ? new Date(date) : new Date(),
    author: req.user?.username || 'fintex-admin'
  });
  res.status(201).json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }
  const { title, content, excerpt, categories, status, date, slug } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) {
    post.content = content;
    post.excerpt = excerpt !== undefined ? excerpt : buildExcerpt(content);
  }
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (Array.isArray(categories)) {
    post.categories = categories.filter((c) => mongoose.isValidObjectId(c));
  }
  if (status) post.status = status;
  if (date) post.date = new Date(date);
  if (slug && slug !== post.slug) post.slug = await uniqueSlug(Post, slug, post._id);
  post.modified = new Date();
  await post.save();
  res.json(post);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Maqola topilmadi');
  }
  res.json({ message: 'Maqola ochirildi', id: req.params.id });
});
