import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) token = header.split(' ')[1];
  if (!token) {
    res.status(401);
    throw new Error('Avtorizatsiya talab qilinadi');
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('Foydalanuvchi topilmadi');
  }
  req.user = user;
  next();
});

export function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403);
  throw new Error('Faqat administrator uchun');
}
