const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const auth = require('../middleware/auth');

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
      
      // Clean up old tokens (keep only last 5 tokens)
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      
      // Fix contentDeletion if it's invalid before saving
      const validContentDeletionValues = ['delete_after_view', 'delete_after_30_days', 'never_delete', '', 'when_viewed', '30_days', 'never'];
      if (user.contentDeletion && !validContentDeletionValues.includes(user.contentDeletion)) {
        console.warn(`Fixing invalid contentDeletion value "${user.contentDeletion}" for user ${user.username}`);
        user.contentDeletion = '';
      }
      
      await user.save();
      res.json({ accessToken, refreshToken, user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Login failed.' });
    }
});

// POST /api/auth/request-reset - request password reset
router.post('/request-reset', [
  body('email').isEmail().withMessage('Email must be a valid email address.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with this email exists, a reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();
    
    // In a real application, you would send an email here
    // For now, we'll just return the token (in production, this should be emailed)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    res.json({ 
      message: 'Password reset link sent to your email.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
});

// POST /api/auth/refresh-token - refresh access token
router.post('/refresh-token', [
  body('refreshToken').isString().withMessage('Refresh token is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { refreshToken } = req.body;
    
    // Find user by refresh token
    const user = await User.findOne({ refreshTokens: refreshToken });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }
    
    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();
    
    // Replace old token with new one (token rotation)
    user.refreshTokens = user.refreshTokens.map(token => 
      token === refreshToken ? newRefreshToken : token
    );
    
    // Clean up old tokens (keep only last 5 tokens)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }
    
    await user.save();
    
    res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
  }
});

// POST /api/auth/cleanup-tokens - cleanup excessive tokens (admin only)
router.post('/cleanup-tokens', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    // Find all users with more than 5 refresh tokens
    const usersWithExcessiveTokens = await User.find({
      $expr: { $gt: [{ $size: '$refreshTokens' }, 5] }
    });
    
    let cleanedCount = 0;
    for (const user of usersWithExcessiveTokens) {
      // Keep only the last 5 tokens
      user.refreshTokens = user.refreshTokens.slice(-5);
      await user.save();
      cleanedCount++;
    }
    
    res.json({ 
      message: `Cleaned up excessive tokens for ${cleanedCount} users.`,
      cleanedCount 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cleanup tokens.' });
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

// POST /api/auth/change-password - change password (auth required)
router.post('/change-password', auth, [
  body('oldPassword').isString().isLength({ min: 6 }).withMessage('Old password must be at least 6 characters.'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    user.passwordHash = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// POST /api/auth/reset-password - reset password with token
router.post('/reset-password', [
  body('token').isString().withMessage('Token is required.'),
  body('newPassword').isString().isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { token, newPassword } = req.body;
    
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }
    
    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password and clear reset token
    user.passwordHash = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
});

module.exports = router; 