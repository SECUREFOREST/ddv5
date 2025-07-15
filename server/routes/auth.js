const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { logAudit } = require('../utils/auditLog');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Helper to generate tokens
function generateAccessToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// POST /api/auth/register
router.post('/register',
  [
    body('username')
      .isString().withMessage('Username must be a string.')
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters.')
      .trim().escape(),
    body('fullName')
      .isString().withMessage('Full name must be a string.')
      .isLength({ min: 3, max: 100 }).withMessage('Full name must be between 3 and 100 characters.')
      .trim().escape(),
    body('email')
      .isEmail().withMessage('Email must be a valid email address.')
      .normalizeEmail(),
    body('password')
      .isString().withMessage('Password must be a string.')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('dob')
      .isISO8601().withMessage('Date of birth must be a valid date.'),
    body('gender')
      .isString().withMessage('Gender must be a string.')
      .isIn(['male', 'female', 'other']).withMessage('Gender must be one of: male, female, other.'),
    body('interestedIn')
      .isArray({ min: 1 }).withMessage('InterestedIn must be a non-empty array.'),
    body('limits').optional().isArray().withMessage('Limits must be an array if provided.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const { username, fullName, email, password, dob, gender, interestedIn, limits } = req.body;
      if (!username || !fullName || !email || !password || !dob || !gender || !Array.isArray(interestedIn) || interestedIn.length === 0) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      // Email format validation
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
      }
      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      const existing = await User.findOne({ $or: [{ email }, { username }] });
      if (existing) {
        return res.status(409).json({ error: 'User already exists.' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        fullName,
        email,
        passwordHash,
        dob,
        gender,
        interestedIn,
        limits: Array.isArray(limits) ? limits : [],
      });
      const refreshToken = generateRefreshToken();
      user.refreshTokens = [refreshToken];
      await user.save();
      const accessToken = generateAccessToken(user);
      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username,
          fullName,
          email,
          dob,
          gender,
          interestedIn,
          limits: user.limits,
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Registration failed.' });
    }
});

// POST /api/auth/login
router.post('/login',
  [
    body('identifier')
      .isString().withMessage('Username or email is required.')
      .trim().escape(),
    body('password')
      .isString().withMessage('Password is required.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const { identifier, password } = req.body;
      if (!identifier || !password) {
        return res.status(400).json({ error: 'Username/email and password required.' });
      }
      // Email format validation (for error message only)
      if (identifier.includes('@')) {
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(identifier)) {
          return res.status(400).json({ error: 'Invalid email format.' });
        }
      }
      // Password strength validation
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      // Find user by username or email
      const user = await User.findOne({ $or: [
        { email: identifier },
        { username: identifier }
      ] });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken();
      user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
      await user.save();
      res.json({ accessToken, refreshToken, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
      res.status(500).json({ error: 'Login failed.' });
    }
});

// POST /api/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) return res.status(401).json({ error: 'Invalid refresh token.' });
    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    const newRefreshToken = generateRefreshToken();
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    const accessToken = generateAccessToken(user);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Failed to refresh token.' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshTokens: refreshToken });
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    }
    res.json({ message: 'Logged out.' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password',
  [
    body('oldPassword').isString(),
    body('newPassword').isString().isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const userId = req.user?.id; // Assume auth middleware sets req.user
      const { oldPassword, newPassword } = req.body;
      if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });
      const valid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid old password.' });
      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();
      await logAudit({ action: 'change_password', user: userId });
      res.json({ message: 'Password changed successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Password change failed.' });
    }
});

// POST /api/auth/request-reset
router.post('/request-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();
    // TODO: Send email with reset link containing token
    // e.g., https://yourapp.com/reset-password?token=TOKEN
    res.json({ message: 'Password reset email sent (if user exists).' });
  } catch (err) {
    res.status(500).json({ error: 'Request failed.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'All fields required.' });
    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await logAudit({ action: 'reset_password', user: user._id });
    res.json({ message: 'Password has been reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Reset failed.' });
  }
});

module.exports = router; 