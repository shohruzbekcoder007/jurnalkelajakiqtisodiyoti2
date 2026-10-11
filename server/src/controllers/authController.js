import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d'
  });
}

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error('Login va parol majburiy');
  }
  const user = await User.findOne({
    $or: [{ username }, { email: String(username).toLowerCase() }]
  }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Login yoki parol notogri');
  }

  res.json({
    token: signToken(user),
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    }
  });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      role: req.user.role
    }
  });
});
