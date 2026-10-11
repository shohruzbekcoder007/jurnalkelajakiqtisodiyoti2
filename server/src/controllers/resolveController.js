import Post from '../models/Post.js';
import Page from '../models/Page.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * The imported content still carries WordPress's `?p=<id>` / `?cat=<id>`
 * query links (the Arxiv and Ruknlar pages are built from them). This turns
 * a legacy id into the path this app serves it at.
 *
 * GET /api/resolve?p=140  ->  { type: 'post', path: '/slug' }
 * GET /api/resolve?cat=4  ->  { type: 'category', path: '/category/slug' }
 */
export const resolveLegacy = asyncHandler(async (req, res) => {
  const { p, page_id: pageId, cat } = req.query;

  if (p) {
    const post = await Post.findOne({ wpId: Number(p) }).select('slug title').lean();
    if (post) return res.json({ type: 'post', path: `/${post.slug}`, title: post.title });
    const asPage = await Page.findOne({ wpId: Number(p) }).select('slug title').lean();
    if (asPage) return res.json({ type: 'page', path: `/${asPage.slug}`, title: asPage.title });
  }

  if (pageId) {
    const found = await Page.findOne({ wpId: Number(pageId) }).select('slug title').lean();
    if (found) return res.json({ type: 'page', path: `/${found.slug}`, title: found.title });
  }

  if (cat) {
    const category = await Category.findOne({ wpId: Number(cat) }).select('slug name').lean();
    if (category) {
      return res.json({ type: 'category', path: `/category/${category.slug}`, title: category.name });
    }
  }

  res.status(404);
  throw new Error('Manzil topilmadi');
});

export default resolveLegacy;
