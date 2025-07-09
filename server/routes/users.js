const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logAudit } = require('../utils/auditLog');
const { checkPermission } = require('../utils/permissions');
const Act = require('../models/Act');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notification');

// GET /api/users (admin only)
router.get('/', auth, checkPermission('view_users'), async (req, res) => {
  const users = await User.find({}, 'username email avatar roles');
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  console.log('GET /users/:id called with id:', req.params.id);
  if (req.params.id === 'me') {
    // If 'me', use the /me logic (requires auth)
    if (!req.headers.authorization) {
      return res.status(401).json({ error: 'Authorization required.' });
    }
    try {
      const token = req.headers.authorization.split(' ')[1];
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        console.log('User not found for userId:', decoded.id);
        return res.status(404).json({ error: 'User not found.' });
      }
      return res.json(user);
    } catch (err) {
      console.error('Error in GET /users/:id (me):', err);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  }
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      console.log('User not found for id:', req.params.id);
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in GET /users/:id:', err);
    res.status(500).json({ error: 'Failed to get user.' });
  }
});

// GET /api/users/me - get current user info (auth required)
router.get('/me', auth, async (req, res) => {
  console.log('GET /users/me called with userId:', req.userId);
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      console.log('User not found for userId:', req.userId);
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in GET /users/me:', err);
    res.status(500).json({ error: 'Failed to get user info.' });
  }
});

// PATCH /api/users/:id (update own profile)
router.patch('/:id', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { username, avatar, bio } = req.body;
    const update = {};
    if (username) update.username = username;
    if (avatar) update.avatar = avatar;
    if (bio !== undefined) update.bio = bio;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    await logAudit({ action: 'update_profile', user: req.userId, target: req.params.id, details: update });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// POST /api/users/:id/block (block another user)
router.post('/:id/block', auth, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: 'Cannot block yourself.' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!user.blockedUsers.includes(req.params.id)) {
      user.blockedUsers.push(req.params.id);
      await user.save();
      await logAudit({ action: 'block_user', user: req.userId, target: req.params.id });
      // Notify blocked user
      await sendNotification(req.params.id, 'user_blocked', 'You have been blocked by another user.');
    }
    res.json({ message: 'User blocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user.' });
  }
});

// Helper: check if user is admin
function isAdmin(req, res, next) {
  User.findById(req.userId).then(user => {
    if (user && user.roles && user.roles.includes('admin')) return next();
    res.status(403).json({ error: 'Admin only.' });
  });
}

// DELETE /api/users/:id (admin only)
router.delete('/:id', auth, checkPermission('delete_user'), async (req, res) => {
  try {
    // Remove or anonymize acts
    await Act.updateMany({ creator: req.params.id }, { $set: { creator: null, title: '[deleted]', description: '' } });
    // Remove or anonymize comments
    await Comment.updateMany({ author: req.params.id }, { $set: { author: null, text: '[deleted]', deleted: true, deletedAt: new Date() } });
    // Remove notifications
    await Notification.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    await logAudit({ action: 'delete_user', user: req.userId, target: req.params.id });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// POST /api/users/:id/ban (admin only)
router.post('/:id/ban', auth, checkPermission('ban_user'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await logAudit({ action: 'ban_user', user: req.userId, target: req.params.id });
    // Notify banned user
    await sendNotification(req.params.id, 'user_banned', 'Your account has been banned by an admin.');
    res.json({ message: 'User banned.', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to ban user.' });
  }
});

// POST /api/auth/impersonate/:id (admin only)
router.post('/../auth/impersonate/:id', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to impersonate user.' });
  }
});

module.exports = router; 