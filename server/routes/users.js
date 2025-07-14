const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logAudit } = require('../utils/auditLog');
const { checkPermission } = require('../utils/permissions');
const Dare = require('../models/Dare');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for avatars
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.params.id + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: avatarStorage });

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
  console.log('PATCH /users/:id handler called for', req.params.id, 'body:', req.body);
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { username, avatar, bio, fullName, gender, dob, interestedIn, limits } = req.body;
    const update = {};
    if (username) update.username = username;
    if (avatar) update.avatar = avatar;
    if (bio !== undefined) update.bio = bio;
    if (fullName) update.fullName = fullName;
    if (gender) update.gender = gender;
    if (dob) update.dob = dob;
    if (Array.isArray(interestedIn)) update.interestedIn = interestedIn;
    if (Array.isArray(limits)) update.limits = limits;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    await logAudit({ action: 'update_profile', user: req.userId, target: req.params.id, details: update });
    res.json(user);
  } catch (err) {
    console.error('PATCH /users/:id error:', err, '\nRequest body:', req.body);
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

// POST /api/users/:id/unblock (unblock another user)
router.post('/:id/unblock', auth, async (req, res) => {
  try {
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: 'Cannot unblock yourself.' });
    }
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const idx = user.blockedUsers.indexOf(req.params.id);
    if (idx !== -1) {
      user.blockedUsers.splice(idx, 1);
      await user.save();
      await logAudit({ action: 'unblock_user', user: req.userId, target: req.params.id });
    }
    res.json({ message: 'User unblocked.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
});

// POST /api/users/:id/avatar
router.post('/:id/avatar', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await User.findByIdAndUpdate(req.params.id, { avatar: avatarUrl });
  res.json({ url: avatarUrl });
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
    // Remove or anonymize dares
    await Dare.updateMany({ creator: req.params.id }, { $set: { creator: null, title: '[deleted]', description: '' } });
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

router.all('*', (req, res) => {
  console.log('users.js catch-all:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not found in users.js' });
});

module.exports = router; 