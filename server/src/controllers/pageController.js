import Page from '../models/Page.js';
import { asyncHandler, uniqueSlug } from '../utils/helpers.js';

// GET /api/pages  — also used to build the header menu
export const listPages = asyncHandler(async (req, res) => {
  const pages = await Page.find({ status: 'publish' })
    .select('wpId title slug menuOrder showInMenu')
    .sort({ menuOrder: 1, title: 1 })
    .lean();
  res.json({ pages });
});

// GET /api/pages/:slug
export const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: req.params.slug, status: 'publish' }).lean();
  if (!page) {
    res.status(404);
    throw new Error('Sahifa topilmadi');
  }
  res.json({ page });
});

export const createPage = asyncHandler(async (req, res) => {
  const { title, content = '', menuOrder = 0, showInMenu = true } = req.body;
  if (!title) {
    res.status(400);
    throw new Error('Sarlavha majburiy');
  }
  const page = await Page.create({
    title,
    slug: await uniqueSlug(Page, req.body.slug || title),
    content,
    menuOrder,
    showInMenu
  });
  res.status(201).json(page);
});

export const updatePage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Sahifa topilmadi');
  }
  const { title, content, menuOrder, showInMenu, slug, status } = req.body;
  if (title !== undefined) page.title = title;
  if (content !== undefined) page.content = content;
  if (menuOrder !== undefined) page.menuOrder = menuOrder;
  if (showInMenu !== undefined) page.showInMenu = showInMenu;
  if (status) page.status = status;
  if (slug && slug !== page.slug) page.slug = await uniqueSlug(Page, slug, page._id);
  await page.save();
  res.json(page);
});

export const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) {
    res.status(404);
    throw new Error('Sahifa topilmadi');
  }
  res.json({ message: 'Sahifa ochirildi', id: req.params.id });
});
