const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/users
router.get('/', async (req, res) => {
  // Optionally: list users (public info only)
  const users = await User.find({}, 'username avatar roles');
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user.' });
  }
});

// GET /api/users/me - get current user info (auth required)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
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
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// POST /api/users/:id/ban (admin only)
router.post('/:id/ban', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
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