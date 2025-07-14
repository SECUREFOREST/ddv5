const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logAudit } = require('../utils/auditLog');
const { checkPermission } = require('../utils/permissions');
const Dare = require('../models/Dare');
const Notification = require('../models/Notification');
const { sendNotification } = require('../utils/notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult, param } = require('express-validator');
const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

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
router.get('/:id',
  (req, res, next) => {
    if (req.params.id === 'me') return next();
    // Validate as MongoId if not 'me'
    if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid user id.' });
    }
    next();
  },
  async (req, res) => {
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
  }
);

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
router.patch('/:id',
  auth,
  [
    body('username').optional().isString().isLength({ min: 3, max: 30 }).trim().escape(),
    body('fullName').optional().isString().isLength({ min: 3, max: 100 }).trim().escape(),
    body('bio').optional().isString().isLength({ max: 500 }).trim().escape(),
    body('gender').optional().isString().isIn(['male', 'female', 'other']),
    body('dob').optional().isISO8601(),
    body('interestedIn').optional().isArray(),
    body('limits').optional().isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    console.log('PATCH /users/:id handler called for', req.params.id, 'body:', req.body);
    try {
      // Allow user to update their own profile, or admin to update anyone
      const isSelf = req.userId === req.params.id;
      const isAdmin = req.user && req.user.roles && req.user.roles.includes('admin');
      if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      const { username, avatar, bio, fullName, gender, dob, interestedIn, limits, roles } = req.body;
      const update = {};
      if (username) update.username = username;
      if (avatar) update.avatar = avatar;
      if (bio !== undefined) update.bio = bio;
      if (fullName) update.fullName = fullName;
      if (gender) update.gender = gender;
      if (dob) update.dob = dob;
      if (Array.isArray(interestedIn)) update.interestedIn = interestedIn;
      if (Array.isArray(limits)) update.limits = limits;
      // Allow self-promotion: allow user to update their own roles
      if ((isSelf || isAdmin) && Array.isArray(roles)) {
        update.roles = roles;
        // If roles are being changed, send a notification
        const targetUser = await User.findById(req.params.id);
        if (targetUser && JSON.stringify(targetUser.roles) !== JSON.stringify(roles)) {
          if (roles.includes('admin') && !targetUser.roles.includes('admin')) {
            await sendNotification(req.params.id, 'role_change', 'You have been promoted to admin.');
          } else if (!roles.includes('admin') && targetUser.roles.includes('admin')) {
            await sendNotification(req.params.id, 'role_change', 'You have been demoted from admin.');
          }
        }
      }
      const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
      await logAudit({ action: 'update_profile', user: req.userId, target: req.params.id, details: update });
      res.json(user);
    } catch (err) {
      console.error('PATCH /users/:id error:', err, '\nRequest body:', req.body);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  }
);

// POST /api/users/:id/block (block another user)
router.post('/:id/block',
  [param('id').isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
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
  }
);

// POST /api/users/:id/unblock (unblock another user)
router.post('/:id/unblock',
  [param('id').isMongoId()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
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
  }
);

// POST /api/users/:id/avatar
router.post('/:id/avatar',
  [param('id').isMongoId()],
  upload.single('file'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    if (req.file) {
      if (!allowedAvatarTypes.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Invalid avatar file type.' });
      }
      if (req.file.size > MAX_AVATAR_SIZE) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Avatar file too large (max 5MB).' });
      }
    }
    const apiBase = process.env.API_BASE_URL || 'https://api.deviantdare.com';
    const avatarUrl = `${apiBase}/uploads/avatars/${req.file.filename}`