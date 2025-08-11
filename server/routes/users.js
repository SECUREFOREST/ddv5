const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { sendNotification } = require('../utils/notification');
const { logAudit } = require('../utils/auditLog');
const { ERROR_MESSAGES, STATUS_CODES, LOG_MESSAGES } = require('../utils/constants');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import models
const User = require('../models/User');
const Dare = require('../models/Dare');
const SwitchGame = require('../models/SwitchGame');
const Notification = require('../models/Notification');

const { checkPermission } = require('../utils/permissions');
const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create avatars directory if it doesn't exist
    const avatarsDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: MAX_AVATAR_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (allowedAvatarTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// Use a blacklist for sensitive fields
const userBlacklist = '-passwordHash -refreshTokens -passwordResetToken -passwordResetExpires';

// GET /api/users (admin only)
router.get('/', auth, checkPermission('view_users'), async (req, res) => {
  try {
    if (req.query.id) {
      const user = await User.findById(req.query.id).select('username email avatar roles banned');
      return res.json(user ? [user] : []);
    }
    
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Search parameter
    const search = req.query.search || '';
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Get paginated users
    const users = await User.find(filter, 'username email avatar roles banned fullName')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// GET /api/users/associates - get user's associates (people they've interacted with)
router.get('/associates', auth, async (req, res) => {
  try {

    const userId = req.userId;
    
    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ error: ERROR_MESSAGES.USER_ID_REQUIRED });
    }
    
    // Verify user exists with better error handling
    let user;
    try {
      user = await User.findById(userId);
      if (!user) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
      }

    } catch (userErr) {
      console.error(LOG_MESSAGES.DB_QUERY_ERROR.replace('{operation}', 'user verification'), userErr);
      return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.USER_VERIFICATION_ERROR });
    }
    
    // Find users the current user has interacted with (through dares or switch games)
    let dares = [];
    let switchGames = [];
    
    
    
    try {
      dares = await Dare.find({
        $or: [
          { creator: userId },
          { performer: userId }
        ]
      }).populate('creator', 'username fullName avatar').populate('performer', 'username fullName avatar').lean();
      
    } catch (dareErr) {
      console.error(LOG_MESSAGES.DB_QUERY_ERROR.replace('{operation}', 'dares fetch'), dareErr);
      dares = [];
    }
    
    try {
      switchGames = await SwitchGame.find({
        $or: [
          { creator: userId },
          { participant: userId }
        ]
      }).populate('creator', 'username fullName avatar').populate('participant', 'username fullName avatar').lean();
      
    } catch (switchErr) {
      console.error(LOG_MESSAGES.DB_QUERY_ERROR.replace('{operation}', 'switch games fetch'), switchErr);
      switchGames = [];
    }
    
    // Extract unique users from interactions
    const associateIds = new Set();
    const associates = [];
    
    // Add users from dares
    if (dares && Array.isArray(dares)) {
      dares.forEach(dare => {
        if (dare.creator && dare.creator._id && dare.creator._id.toString() !== userId) {
          if (!associateIds.has(dare.creator._id.toString())) {
            associateIds.add(dare.creator._id.toString());
            associates.push(dare.creator);
          }
        }
        if (dare.performer && dare.performer._id && dare.performer._id.toString() !== userId) {
          if (!associateIds.has(dare.performer._id.toString())) {
            associateIds.add(dare.performer._id.toString());
            associates.push(dare.performer);
          }
        }
      });
    }
    
    // Add users from switch games
    if (switchGames && Array.isArray(switchGames)) {
      switchGames.forEach(game => {
        if (game.creator && game.creator._id && game.creator._id.toString() !== userId) {
          if (!associateIds.has(game.creator._id.toString())) {
            associateIds.add(game.creator._id.toString());
            associates.push(game.creator);
          }
        }
        if (game.participant && game.participant._id && game.participant._id.toString() !== userId) {
          if (!associateIds.has(game.participant._id.toString())) {
            associateIds.add(game.participant._id.toString());
            associates.push(game.participant);
          }
        }
      });
    }
    
    
    
    res.json(associates);
  } catch (err) {
    console.error(LOG_MESSAGES.ENDPOINT_ERROR.replace('{endpoint}', 'associates'), err);
    // Return empty array instead of error to prevent client-side crashes
    res.json([]);
  }
});

// GET /api/users/:id - get user by ID (public)
router.get('/:id', async (req, res) => {
  try {
    let user;
    if (req.params.id === 'me') {
      // Get current user from token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided.' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
    } else {
      // Get user by ID
      user = await User.findById(req.params.id).select('-password -blockedUsers');
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// GET /api/users/me - get current user (auth required)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// GET /api/users/user_settings - get user settings
router.get('/user_settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('settings');
    res.json({ dashboard_tab: user?.settings?.dashboard_tab || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user settings.' });
  }
});

// POST /api/users/user_settings - update user settings
router.post('/user_settings', auth, async (req, res) => {
  try {
    const { dashboard_tab } = req.body;
    const updates = {};
    
    if (dashboard_tab !== undefined) {
      updates['settings.dashboard_tab'] = dashboard_tab;
    }
    
    await User.findByIdAndUpdate(req.userId, { $set: updates });
    res.json({ message: 'Settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user settings.' });
  }
});

// PATCH /api/users/:id - update user (auth required, admin or self)
router.patch('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    // Check if user is updating themselves or is admin
    if (req.params.id !== req.userId) {
      const currentUser = await User.findById(req.userId);
      if (!currentUser || !currentUser.roles || !currentUser.roles.includes('admin')) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
    }
    
    // Update allowed fields
    const allowedUpdates = ['fullName', 'email', 'avatar', 'bio', 'preferences', 'username', 'roles'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided.' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    // Log audit if admin is updating another user
    if (req.params.id !== req.userId) {
      await logAudit({ 
        action: 'update_user', 
        user: req.userId, 
        target: req.params.id,
        details: { updatedFields: Object.keys(updates) }
      });
    }
    
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id (admin only)
router.delete('/:id', auth, checkPermission('delete_user'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await logAudit({ action: 'delete_user', user: req.userId, target: req.params.id });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// POST /api/users/:id/block - block a user
router.post('/:id/block', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.userId;
    
    if (targetUserId === userId) {
      return res.status(400).json({ error: 'You cannot block yourself.' });
    }
    
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!user.blockedUsers) user.blockedUsers = [];
    if (!targetUser.blockedUsers) targetUser.blockedUsers = [];
    
    // Add to blocked users if not already blocked
    if (!user.blockedUsers.includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
      await user.save();
    }
    
    // Send notification to blocked user
    await sendNotification(targetUserId, 'user_blocked', 'You have been blocked by another user.', userId);
    
    res.json({ message: 'User blocked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block user.' });
  }
});

// POST /api/users/:id/unblock - unblock a user
router.post('/:id/unblock', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const userId = req.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!user.blockedUsers) user.blockedUsers = [];
    
    // Remove from blocked users
    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId);
    await user.save();
    
    res.json({ message: 'User unblocked successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unblock user.' });
  }
});

// POST /api/users/:id/avatar - upload avatar
router.post('/:id/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }
    
    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Update user's avatar
    await User.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true });
    
    res.json({ message: 'Avatar uploaded successfully.', avatar: avatarUrl });
  } catch (err) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    res.status(500).json({ error: 'Failed to upload avatar.' });
  }
});

// GET /api/user/slots - get user's slot information
router.get('/user/slots', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Count open dares (in_progress or waiting_for_participant)
    const openDares = await Dare.countDocuments({
      performer: req.userId,
      status: { $in: ['in_progress', 'waiting_for_participant'] }
    });
    
    // Count open switch games
    const openSwitchGames = await SwitchGame.countDocuments({
      $or: [
        { creator: req.userId, status: { $in: ['in_progress', 'waiting_for_participant'] } },
        { participant: req.userId, status: { $in: ['in_progress', 'waiting_for_participant'] } }
      ]
    });
    
    const totalOpenSlots = openDares + openSwitchGames;
    const maxSlots = 5; // This could be configurable per user
    
    res.json({
      openSlots: totalOpenSlots,
      maxSlots,
      cooldownUntil: user.cooldownUntil || null,
      inCooldown: user.cooldownUntil && new Date(user.cooldownUntil) > new Date()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch slot information.' });
  }
});

// POST /api/subs - submit an offer/dare submission
router.post('/subs', auth, [
  body('description').isString().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters.'),
  body('difficulty').isString().isIn(['titillating', 'daring', 'shocking']).withMessage('Difficulty must be one of: titillating, daring, shocking.'),
  body('tags').optional().isArray().withMessage('Tags must be an array.'),
  body('privacy').optional().isString().isIn(['when_viewed', 'after_completion', 'never']).withMessage('Privacy must be one of: when_viewed, after_completion, never.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { description, difficulty, tags = [], privacy = 'when_viewed' } = req.body;
    
    // Check if user is in cooldown
    const user = await User.findById(req.userId);
    if (user.cooldownUntil && new Date(user.cooldownUntil) > new Date()) {
      return res.status(400).json({ error: 'You are currently in cooldown. Please wait before submitting another offer.' });
    }
    
    // Check slot limit
    const openDares = await Dare.countDocuments({
      performer: req.userId,
      status: { $in: ['in_progress', 'waiting_for_participant'] }
    });
    
    if (openDares >= 5) {
      return res.status(400).json({ error: 'You have reached the maximum number of open dares (5).' });
    }
    
    // Create the dare
    const dare = new Dare({
      description,
      difficulty,
      tags,
      creator: req.userId,
      status: 'waiting_for_participant',
      public: true,
      dareType: 'submission',
      privacy
    });
    
    await dare.save();
    
    // Update user's open dares count
    await User.findByIdAndUpdate(req.userId, { $inc: { openDares: 1 } });
    
    res.status(201).json({ 
      message: 'Offer submitted successfully!',
      dare: {
        _id: dare._id,
        description: dare.description,
        difficulty: dare.difficulty,
        status: dare.status
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit offer.' });
  }
});

// POST /api/blocks/:userId/:action - block/unblock user
router.post('/blocks/:userId/:action', auth, async (req, res) => {
  try {
    const { userId, action } = req.params;
    const currentUserId = req.userId;
    
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'You cannot block yourself.' });
    }
    
    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    if (!user.blockedUsers) user.blockedUsers = [];
    if (!targetUser.blockedUsers) targetUser.blockedUsers = [];
    
    if (action === 'block') {
      // Add to blocked users if not already blocked
      if (!user.blockedUsers.includes(userId)) {
        user.blockedUsers.push(userId);
        await user.save();
      }
      
      // Send notification to blocked user
      await sendNotification(userId, 'user_blocked', 'You have been blocked by another user.', currentUserId);
      
      res.json({ message: 'User blocked successfully.' });
    } else if (action === 'unblock') {
      // Remove from blocked users
      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== userId);
      await user.save();
      
      res.json({ message: 'User unblocked successfully.' });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "block" or "unblock".' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process block action.' });
  }
});

module.exports = router;