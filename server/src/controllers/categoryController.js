import Category from '../models/Category.js';
import Post from '../models/Post.js';
import { asyncHandler, uniqueSlug } from '../utils/helpers.js';

// GET /api/categories
export const listCategories = asyncHandler(async (req, res) => {
  const hideEmpty = req.query.hide_empty === 'true';
  const filter = hideEmpty ? { count: { $gt: 0 } } : {};
  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  res.json({ categories });
});

// GET /api/categories/:slug
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) {
    res.status(404);
    throw new Error('Rukn topilmadi');
  }
  res.json({ category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description = '' } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Nom majburiy');
  }
  const category = await Category.create({
    name,
    slug: await uniqueSlug(Category, req.body.slug || name),
    description
  });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Rukn topilmadi');
  }
  const { name, description, slug } = req.body;
  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (slug && slug !== category.slug) category.slug = await uniqueSlug(Category, slug, category._id);
  await category.save();
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Rukn topilmadi');
  }
  await Post.updateMany({ categories: category._id }, { $pull: { categories: category._id } });
  await category.deleteOne();
  res.json({ message: 'Rukn ochirildi', id: req.params.id });
});
