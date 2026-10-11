import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as posts from '../controllers/postController.js';
import * as categories from '../controllers/categoryController.js';
import * as pages from '../controllers/pageController.js';
import * as comments from '../controllers/commentController.js';
import * as auth from '../controllers/authController.js';
import * as submissions from '../controllers/submissionController.js';
import { resolveLegacy } from '../controllers/resolveController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Juda kop soʻrov yuborildi, birozdan keyin urinib koʻring.' }
});

/* -------------------------------- public --------------------------------- */
router.get('/resolve', resolveLegacy);
router.get('/posts', posts.listPosts);
router.get('/posts/featured', posts.featuredPosts);
router.get('/posts/archive/calendar', posts.calendar);
router.get('/posts/archive/months', posts.archiveMonths);
router.get('/posts/admin/all', protect, posts.adminListPosts);
router.get('/posts/admin/one/:id', protect, posts.adminGetPost);
router.get('/posts/:slug', posts.getPost);

router.get('/categories', categories.listCategories);
router.get('/categories/:slug', categories.getCategory);

router.get('/pages', pages.listPages);
router.get('/pages/:slug', pages.getPage);

router.get('/comments/post/:slug', comments.listByPost);
router.post('/comments', writeLimiter, comments.createComment);

router.post('/submissions', writeLimiter, submissions.createSubmission);

router.post('/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), auth.login);
router.get('/auth/me', protect, auth.me);

/* --------------------------------- admin --------------------------------- */
router.post('/posts', protect, adminOnly, posts.createPost);
router.put('/posts/:id', protect, adminOnly, posts.updatePost);
router.delete('/posts/:id', protect, adminOnly, posts.deletePost);

router.post('/categories', protect, adminOnly, categories.createCategory);
router.put('/categories/:id', protect, adminOnly, categories.updateCategory);
router.delete('/categories/:id', protect, adminOnly, categories.deleteCategory);

router.post('/pages', protect, adminOnly, pages.createPage);
router.put('/pages/:id', protect, adminOnly, pages.updatePage);
router.delete('/pages/:id', protect, adminOnly, pages.deletePage);

router.get('/comments', protect, adminOnly, comments.adminListComments);
router.put('/comments/:id/approve', protect, adminOnly, comments.approveComment);
router.delete('/comments/:id', protect, adminOnly, comments.deleteComment);

router.get('/submissions', protect, adminOnly, submissions.adminListSubmissions);
router.put('/submissions/:id', protect, adminOnly, submissions.updateSubmission);
router.delete('/submissions/:id', protect, adminOnly, submissions.deleteSubmission);

export default router;
