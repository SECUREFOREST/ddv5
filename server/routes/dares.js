const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { checkPermission } = require('../utils/permissions');
const { sendNotification } = require('../utils/notification');
const { logActivity } = require('../utils/activity');
const { logAudit } = require('../utils/auditLog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Import models
const Dare = require('../models/Dare');
const User = require('../models/User');

const allowedProofTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'];
const MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10MB

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Helper: check if user is admin (reuse from users.js)
function isAdmin(req, res, next) {
  User.findById(req.userId).then(user => {
    if (user && user.roles && user.roles.includes('admin')) return next();
    res.status(403).json({ error: 'Admin only.' });
  });
}

// Helper: enforce slot/cooldown (atomic)
async function checkSlotAndCooldownAtomic(userId) {
  const now = new Date();
  // Check cooldown
  const user = await User.findById(userId).select('dareCooldownUntil');
  if (user && user.dareCooldownUntil && user.dareCooldownUntil > now) {
    throw new Error('You are in cooldown or have reached the maximum of 5 open dares.');
  }
  // Count dares where user is performer and status is not completed or forfeited
  const openDaresCount = await Dare.countDocuments({
    performer: userId,
    status: { $nin: ['completed', 'forfeited'] }
  });
  if (openDaresCount >= 5) {
    throw new Error('You are in cooldown or have reached the maximum of 5 open dares.');
  }
}

// Helper: cleanup orphaned dares (admin only)
const { cleanupOrphanedDares } = require('../utils/cleanup');

// POST /api/dares/cleanup - cleanup orphaned dares (admin only)
router.post('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const result = await cleanupOrphanedDares();
    res.json({ 
      message: 'Cleanup completed successfully',
      result 
    });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ error: 'Failed to run cleanup.' });
  }
});

// GET /api/dares - list dares (optionally filter by status, difficulty, public, dareType, allowedRoles)
router.get('/', auth, async (req, res, next) => {
  try {
    if (req.query.id) {
      const dare = await Dare.findById(req.query.id)
        .populate('creator', 'username fullName avatar')
        .populate('performer', 'username fullName avatar')
        .populate('assignedSwitch', 'username fullName avatar');
      return res.json(dare ? [dare] : []);
    }
    const { status, difficulty, public: isPublic, dareType, role, creator, participant, assignedSwitch, search } = req.query;
    const filter = {};
    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    if (difficulty) filter.difficulty = difficulty;
    if (isPublic !== undefined) filter.public = isPublic === 'true';
    if (dareType) filter.dareType = dareType;
    if (creator) filter.creator = creator;
    if (participant) filter.performer = participant;
    if (assignedSwitch) filter.assignedSwitch = assignedSwitch;
    // Add search functionality
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add role filter (after search to avoid conflicts)
    if (role) {
      if (filter.$or) {
        // If we already have $or from search, we need to use $and
        filter.$and = [
          { $or: filter.$or },
          { $or: [
            { allowedRoles: { $exists: false } },
            { allowedRoles: { $size: 0 } },
            { allowedRoles: role }
          ]}
        ];
        delete filter.$or;
      } else {
        filter.$or = [
          { allowedRoles: { $exists: false } },
          { allowedRoles: { $size: 0 } },
          { allowedRoles: role }
        ];
      }
    }
    
    // No content expiration filter - dares don't expire, only proofs do
    
    // Fetch blocked users for filtering
    const user = await User.findById(req.userId).select('blockedUsers');
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await Dare.countDocuments(filter);
    
    // Get paginated dares
    const dares = await Dare.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .populate('assignedSwitch', 'username fullName avatar')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Filter out dares involving blocked users
    const filteredDares = user && user.blockedUsers && user.blockedUsers.length > 0
      ? dares.filter(dare => {
          const ids = [dare.creator?._id?.toString(), dare.performer?._id?.toString(), dare.assignedSwitch?._id?.toString()];
          return !ids.some(id => id && user.blockedUsers.map(bu => bu.toString()).includes(id));
        })
      : dares;
    
    res.json({
      dares: filteredDares,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dares.' });
  }
});

// Add after other GET endpoints
router.get('/random', auth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    const userId = req.userId;
    // Prevent claiming if in cooldown or at open dare limit
    await checkSlotAndCooldownAtomic(userId);
    // Exclude dares already consented to or completed by this user
    const user = await require('../models/User').findById(userId).select('consentedDares completedDares');
    const excludeDares = [
      ...(user.consentedDares || []),
      ...(user.completedDares || [])
    ];
    const filter = {
      status: 'waiting_for_participant',
      performer: null,
      creator: { $ne: userId }
    };
    if (difficulty) filter.difficulty = difficulty;
    if (excludeDares.length > 0) filter._id = { $nin: excludeDares };
    const count = await Dare.countDocuments(filter);
    if (count === 0) {
      return res.json({});
    }
    const rand = Math.floor(Math.random() * count);
    // Find a random dare first
    const dareDoc = await Dare.find(filter).skip(rand).limit(1);
    if (!dareDoc.length) {
      return res.json({});
    }
    // Prevent creator from performing their own dare
    if (dareDoc[0].creator.toString() === userId) {
      return res.status(400).json({ error: 'You cannot perform your own dare.' });
    }
    // Blocked user check
    const creator = await require('../models/User').findById(dareDoc[0].creator).select('blockedUsers');
    const performerUser = await require('../models/User').findById(userId).select('blockedUsers');
    if (
      (creator.blockedUsers && creator.blockedUsers.includes(userId)) ||
      (performerUser.blockedUsers && performerUser.blockedUsers.includes(dareDoc[0].creator.toString()))
    ) {
      return res.status(400).json({ error: 'You cannot perform this dare due to user blocking.' });
    }
    // Atomically assign the dare to this user if not already taken
    const dare = await Dare.findOneAndUpdate(
      { _id: dareDoc[0]._id, performer: null },
      { performer: userId, status: 'in_progress', updatedAt: new Date() },
      { new: true }
    );
    if (!dare) {
      return res.json({});
    }
    // Track consent in user
    await require('../models/User').findByIdAndUpdate(userId, { $addToSet: { consentedDares: dare._id } });
    // Audit log
    await require('../utils/auditLog').logAudit({ action: 'consent_dare', user: userId, target: dare._id });
    res.json(dare);
  } catch (err) {
    // User-friendly error for cooldown or open dares limit
    if (
      err.message &&
      (err.message.includes('cooldown') || err.message.includes('maximum of 5 open dares'))
    ) {
      return res.status(429).json({
        error: 'You are in cooldown or have reached the maximum of 5 open dares. Please complete or forfeit some dares, or wait for your cooldown to expire.'
      });
    }
    res.status(500).json({ error: 'Failed to get dare.' });
  }
});

// GET /api/dares/performer - get all dares where current user is the performer
router.get('/performer', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { performer: req.userId };
    if (status) filter.status = status;
    const dares = await Dare.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .sort({ updatedAt: -1 });
    res.json(dares);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performer dares.' });
  }
});

// GET /api/dares/mine - get all dares where current user is creator or performer
router.get('/mine', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const mongoose = require('mongoose');
    let userId = req.userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userId = new mongoose.Types.ObjectId(userId);
    }
    const filter = {
      $or: [
        { creator: userId },
        { performer: userId }
      ]
    };
    if (status) {
      if (status.includes(',')) {
        filter.status = { $in: status.split(',') };
      } else {
        filter.status = status;
      }
    }
    const dares = await Dare.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .sort({ updatedAt: -1 });
    res.json(dares);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your dares.' });
  }
});

// GET /api/dares/:id - get dare details
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching dare details for ID: ${req.params.id}`);
    
    const dare = await Dare.findById(req.params.id)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .populate('assignedSwitch', 'username fullName avatar');
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    
    console.log(`Dare found. Creator data:`, {
      hasCreator: !!dare.creator,
      creatorType: typeof dare.creator,
      creatorId: dare.creator?._id || dare.creator,
      hasUsername: !!dare.creator?.username,
      hasFullName: !!dare.creator?.fullName
    });
    
    // Enhanced creator population logic
    if (!dare.creator || !dare.creator.username) {
      console.log(`Dare ${req.params.id} has missing creator data:`, dare.creator);
      
      // Try to fetch the user if only an ID is present
      if (dare.creator && typeof dare.creator === 'object' && dare.creator._id) {
        const user = await User.findById(dare.creator._id).select('username fullName avatar');
        if (user) {
          dare.creator = user;
          console.log(`Successfully populated creator for dare ${req.params.id}:`, user.username);
        } else {
          console.log(`User not found for creator ID: ${dare.creator._id}`);
          dare.creator = null;
        }
      } else if (dare.creator && typeof dare.creator === 'string') {
        const user = await User.findById(dare.creator).select('username fullName avatar');
        if (user) {
          dare.creator = user;
          console.log(`Successfully populated creator for dare ${req.params.id}:`, user.username);
        } else {
          console.log(`User not found for creator ID: ${dare.creator}`);
          dare.creator = null;
        }
      } else {
        console.log(`No creator data found for dare ${req.params.id}`);
        dare.creator = null;
      }
    }
    
    console.log(`Final creator data for dare ${req.params.id}:`, {
      hasCreator: !!dare.creator,
      username: dare.creator?.username,
      fullName: dare.creator?.fullName
    });
    
    res.json(dare);
  } catch (err) {
    console.error('Error fetching dare details:', err);
    res.status(500).json({ error: 'Failed to get dare.' });
  }
});

// POST /api/dares/dom-demand - create a dom demand with double-consent protection
router.post('/dom-demand',
  auth,
  [
    body('description')
      .isString().withMessage('Description must be a string.')
      .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters.')
      .trim().escape(),
    body('difficulty')
      .isString().withMessage('Difficulty must be a string.')
      .isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']).withMessage('Difficulty must be one of: titillating, arousing, explicit, edgy, hardcore.'),
    body('tags').optional().isArray().withMessage('Tags must be an array.'),
    body('public').optional().isBoolean().withMessage('Public must be true or false.'),
    body('requiresConsent').optional().isBoolean().withMessage('RequiresConsent must be true or false.'),
    body('allowedRoles').optional().isArray().withMessage('AllowedRoles must be an array.'),
    body('contentDeletion').optional().isString().isIn(['delete_after_view', 'delete_after_30_days', 'never_delete']).withMessage('ContentDeletion must be one of: delete_after_view, delete_after_30_days, never_delete.'),
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
      const { description, difficulty, tags = [], public: isPublic = true, requiresConsent = true, allowedRoles = [], contentDeletion = 'delete_after_30_days' } = req.body;
      
      // OSA-style content expiration setup (automatic)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      // Create dom demand with double-consent protection
      const dare = new Dare({
        description,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        public: isPublic,
        dareType: 'domination',
        requiresConsent: true, // Always true for dom demands
        allowedRoles: Array.isArray(allowedRoles) ? allowedRoles : [],
        contentDeletion,
        creator: req.userId,
        status: 'waiting_for_participant',
        claimable: true,
        claimToken: uuidv4(),
        // No content expiration - dares don't expire, only proofs do
      });
      
      await dare.save();
      await dare.populate('creator', 'username fullName avatar');
      
      // Generate claim link
      const claimLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/claim/${dare.claimToken}`;
      
      await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
      
      res.status(201).json({
        message: 'Dom demand created successfully with double-consent protection',
        dare,
        claimLink
      });
    } catch (err) {
      console.error('Dom demand creation error:', err);
      res.status(500).json({ error: err.message || 'Failed to create dom demand.' });
    }
  }
);

// POST /api/dares - create dare (auth required)
router.post('/',
  auth,
  [
    body('description')
      .isString().withMessage('Description must be a string.')
      .isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters.')
      .trim().escape(),
    body('difficulty')
      .isString().withMessage('Difficulty must be a string.')
      .isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']).withMessage('Difficulty must be one of: titillating, arousing, explicit, edgy, hardcore.'),
    body('dareType').optional()
      .isString().withMessage('Dare type must be a string.')
      .isIn(['submission', 'domination', 'switch']).withMessage('Dare type must be one of: submission, domination, switch.'),
    body('tags').optional().isArray().withMessage('Tags must be an array.'),
    body('public').optional().isBoolean().withMessage('Public must be true or false.'),
    body('allowedRoles').optional().isArray().withMessage('AllowedRoles must be an array.'),
    body('claimable').optional().isBoolean().withMessage('Claimable must be true or false.'),
    body('claimToken').optional().isString().withMessage('ClaimToken must be a string.'),
    body('claimDemand').optional().isString().withMessage('ClaimDemand must be a string.'),
    body('contentDeletion').optional().isString().isIn(['delete_after_view', 'delete_after_30_days', 'never_delete']).withMessage('ContentDeletion must be one of: delete_after_view, delete_after_30_days, never_delete.'),
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
      const { description, difficulty, tags, assignedSwitch, dareType, public: isPublic, allowedRoles, contentDeletion } = req.body;
      if (!description) return res.status(400).json({ error: 'Description is required.' });
      if (!difficulty) return res.status(400).json({ error: 'Difficulty is required.' });
      
      // OSA-style content expiration setup (automatic)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const dare = new Dare({
        description,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        creator: req.userId,
        assignedSwitch: assignedSwitch || undefined,
        status: 'waiting_for_participant', // Updated to match new status
        dareType: dareType || 'submission',
        public: isPublic !== undefined ? isPublic : true,
        allowedRoles: Array.isArray(allowedRoles) ? allowedRoles : [],
        contentDeletion: contentDeletion || 'delete_after_30_days',
        // No content expiration - dares don't expire, only proofs do
      });
      await dare.save();
      await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
      // Notify the creator
      await sendNotification(req.userId, 'dare_created', `Your dare has been created.`, req.userId);
      res.status(201).json(dare);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create dare.' });
    }
  }
);

// PATCH /api/dares/:id - update dare (auth required, only creator)
router.patch('/:id',
  auth,
  [
    require('express-validator').param('id').isMongoId(),
    require('express-validator').body('description').optional().isString().isLength({ min: 5, max: 500 }).trim().escape(),
    require('express-validator').body('difficulty').optional().isString().isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']),
    require('express-validator').body('status').optional().isString().isIn(['waiting_for_participant', 'in_progress', 'completed', 'forfeited', 'approved', 'rejected', 'pending', 'soliciting', 'expired', 'cancelled', 'graded', 'user_deleted']),
    require('express-validator').body('tags').optional().isArray(),
    require('express-validator').body('assignedSwitch').optional().isString().isLength({ min: 1 }),
    require('express-validator').body('dareType').optional().isString().isIn(['submission', 'domination', 'switch']),
    require('express-validator').body('public').optional().isBoolean(),
    require('express-validator').body('allowedRoles').optional().isArray(),
    require('express-validator').body('contentDeletion').optional().isString().isIn(['delete_after_view', 'delete_after_30_days', 'never_delete'])
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (dare.creator.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      const { description, difficulty, status, tags, assignedSwitch, dareType, public: isPublic, allowedRoles, contentDeletion } = req.body;
      if (description) dare.description = description;
      if (difficulty) dare.difficulty = difficulty;
      if (status) dare.status = status;
      if (tags) dare.tags = Array.isArray(tags) ? tags : [];
      if (assignedSwitch !== undefined) dare.assignedSwitch = assignedSwitch;
      if (dareType) dare.dareType = dareType;
      if (isPublic !== undefined) dare.public = isPublic;
      if (allowedRoles) dare.allowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [];
      if (contentDeletion) dare.contentDeletion = contentDeletion;
      dare.updatedAt = new Date();
      await dare.save();
      res.json(dare);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update dare.' });
    }
  }
);

// POST /api/dares/:id/grade - grade a dare
router.post('/:id/grade', auth, [
  body('grade').isNumeric().custom((value) => {
    console.log('Validating grade value:', value, 'type:', typeof value);
    const num = parseFloat(value);
    console.log('Parsed number:', num);
    if (num < 1 || num > 5 || !Number.isInteger(num)) {
      console.log('Validation failed: num < 1:', num < 1, 'num > 5:', num > 5, '!Number.isInteger(num):', !Number.isInteger(num));
      throw new Error('Grade must be an integer between 1 and 5.');
    }
    return true;
  })
], async (req, res) => {
  console.log('Received request body:', req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    console.log('Received grade request:', req.body);
    const { grade, feedback, target } = req.body;
    const dare = await Dare.findById(req.params.id);
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Check if user can grade this dare
    const canGrade = dare.creator.toString() === req.userId || 
                    (dare.performer && dare.performer.toString() === req.userId);
    
    if (!canGrade) {
      return res.status(403).json({ error: 'You cannot grade this dare.' });
    }
    
    // Check if user has already graded this dare and update existing grade
    const existingGradeIndex = dare.grades ? dare.grades.findIndex(g => g.user.toString() === req.userId && !g.target) : -1;
    
    if (existingGradeIndex !== -1) {
      // Update existing grade
      dare.grades[existingGradeIndex].grade = parseInt(grade);
      dare.grades[existingGradeIndex].feedback = feedback || '';
      dare.grades[existingGradeIndex].updatedAt = new Date();
    } else {
      // Add new grade
      const gradeData = {
        user: req.userId,
        grade: parseInt(grade),
        feedback: feedback || '',
        createdAt: new Date()
      };
      
      if (target) {
        gradeData.target = target;
      }
      
      if (!dare.grades) dare.grades = [];
      dare.grades.push(gradeData);
    }
    
    await dare.save();
    
    // Notify the other party
    const targetUser = dare.creator.toString() === req.userId ? dare.performer : dare.creator;
    if (targetUser) {
      await sendNotification(
        targetUser,
        'dare_graded',
        `You received a grade of ${grade} for dare: "${dare.description}".`,
        req.userId
      );
    }
    
    res.json({ message: 'Grade submitted successfully.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit grade.' });
  }
});

// GET /api/dares/:id/grades - get grades for a dare
router.get('/:id/grades', auth, async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id);
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Check if user can view grades for this dare
    const canView = dare.creator.toString() === req.userId || 
                    (dare.performer && dare.performer.toString() === req.userId);
    
    if (!canView) {
      return res.status(403).json({ error: 'You cannot view grades for this dare.' });
    }
    
    res.json(dare.grades || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch grades.' });
  }
});

// POST /api/dares/:id/grade-user - grade a user within a dare (auth required)
router.post('/:id/grade-user',
  auth,
  [
    body('grade').isInt({ min: 1, max: 5 }),
    body('feedback').optional().isString().isLength({ max: 500 }).trim().escape(),
    body('target').isString().isLength({ min: 1 })
  ],
  async (req, res) => {
    console.log('Grade-user route hit - Received request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Grade-user route - Validation errors:', errors.array());
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (dare.proofExpiresAt && new Date(dare.proofExpiresAt) < new Date()) {
        return res.status(400).json({ error: 'Proof has expired. Grading is not allowed.' });
      }
      if (!dare.performer || dare.performer.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      const { grade, feedback, target } = req.body;
      if (!target) return res.status(400).json({ error: 'Target user is required for grading.' });
      // Prevent duplicate grades for the same (user, target) pair
      if (dare.grades.some(g => g.user.toString() === req.userId && g.target && g.target.toString() === target)) {
        return res.status(400).json({ error: 'You have already graded this user for this dare.' });
      }
      // Blocked user check for grading
      const graderUserGrade = await User.findById(req.userId).select('blockedUsers');
      const targetUserGrade = await User.findById(target).select('blockedUsers');
      if (
        (graderUserGrade.blockedUsers && graderUserGrade.blockedUsers.includes(target)) ||
        (targetUserGrade.blockedUsers && targetUserGrade.blockedUsers.includes(req.userId))
      ) {
        return res.status(400).json({ error: 'You cannot grade this user due to user blocking.' });
      }
      dare.grades.push({ user: req.userId, target, grade, feedback });
      await dare.save();
      await logActivity({ type: 'grade_given', user: req.userId, dare: dare._id, details: { grade, feedback, target } });
      // Notify the target user with more detail
      const graderUser = await User.findById(req.userId).select('username');
      await sendNotification(
        target,
        'dare_graded',
        `You received a grade of ${grade} from ${graderUser?.username || 'someone'} for dare: "${dare.description}".`,
        req.userId
      );
      res.json({ message: 'Grade submitted.', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit grade.' });
    }
  }
);

// POST /api/dares/:id/proof - submit proof (auth required, performer only, slot/cooldown enforced)
router.post('/:id/proof',
  upload.single('file'),
  [
    body('text').optional().isString().isLength({ max: 1000 }).trim().escape(),
    body('expireAfterView').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      if (req.file) {
        if (!allowedProofTypes.includes(req.file.mimetype)) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'Invalid file type.' });
        }
        if (req.file.size > MAX_PROOF_SIZE) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'File too large (max 10MB).' });
        }
      }
      // Use UTC for all date calculations
      const now = new Date();
      // await checkSlotAndCooldownAtomic(req.userId); // Removed: do not enforce cooldown/open dare limit on completion
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (!dare.performer || dare.performer.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      const text = req.body.text || '';
      let fileUrl = null, fileName = null;
      if (req.file) {
        fileName = req.file.originalname;
        fileUrl = `/uploads/${req.file.filename}`;
      }
      dare.proof = { text, fileUrl, fileName };
      dare.status = 'completed';
      dare.completedAt = now;
      dare.updatedAt = now;
      
      // Set proof expiration based on content deletion preference
      let proofExpirationHours = 48; // Default 48 hours
      if (dare.contentDeletion === 'delete_after_view') {
        proofExpirationHours = 1; // 1 hour for view-once content
      } else if (dare.contentDeletion === 'delete_after_30_days') {
        proofExpirationHours = 30 * 24; // 30 days
      } else if (dare.contentDeletion === 'never_delete') {
        proofExpirationHours = 60 * 24; // 60 days (2 months)
      }
      
      dare.proofExpiresAt = new Date(now.getTime() + proofExpirationHours * 60 * 60 * 1000);
      await dare.save();
      await User.findByIdAndUpdate(req.userId, { $inc: { openDares: -1 } });
      // Notify creator
      await sendNotification(dare.creator, 'proof_submitted', `Proof has been submitted for your dare "${dare.description}".`, req.userId);
      res.json({ message: 'Proof submitted.', proof: dare.proof });
    } catch (err) {
      // If file was uploaded but DB update failed, delete the file
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
        }
      }
      res.status(400).json({ error: err.message || 'Failed to submit proof.' });
    }
  }
);

// POST /api/dares/:id/accept - user consents to perform a dare, optionally sets difficulty
router.post('/:id/accept',
  auth,
  [
    require('express-validator').param('id').isMongoId(),
    require('express-validator').body('difficulty').optional().isString().isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']),
    require('express-validator').body('consent').optional().isBoolean(),
    require('express-validator').body('contentDeletion').optional().isString().isIn(['delete_after_view', 'delete_after_30_days', 'never_delete'])
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { difficulty, consent, contentDeletion } = req.body;
      
      // Validate consent
      if (!consent) {
        return res.status(400).json({ error: 'You must consent to participate in this dare.' });
      }
      
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (dare.performer) return res.status(400).json({ error: 'Dare already has a performer.' });
      if (dare.creator.toString() === req.userId) {
        return res.status(400).json({ error: 'You cannot perform your own dare.' });
      }
      
      // Blocked user check
      const creator2 = await User.findById(dare.creator).select('blockedUsers');
      const performerUser2 = await User.findById(req.userId).select('blockedUsers');
      
      // Prevent accepting if in cooldown or at open dare limit
      await checkSlotAndCooldownAtomic(req.userId);
      
      if (
        (creator2.blockedUsers && creator2.blockedUsers.includes(req.userId)) ||
        (performerUser2.blockedUsers && performerUser2.blockedUsers.includes(dare.creator.toString()))
      ) {
        return res.status(400).json({ error: 'You cannot perform this dare due to user blocking.' });
      }
      
      // Update dare with performer and difficulty
      if (difficulty) dare.difficulty = difficulty;
      dare.performer = req.userId;
      dare.status = 'in_progress';
      dare.updatedAt = new Date();
      
      // Store content deletion preference (for future proof submissions)
      if (contentDeletion) {
        dare.contentDeletion = contentDeletion;
      }
      
      await dare.save();
      
      // Notify performer (the user accepting)
      await sendNotification(req.userId, 'dare_assigned', `You have been assigned as the performer for the dare: "${dare.description}"`, req.userId);
      // Optionally notify creator
      await sendNotification(dare.creator, 'dare_assigned', `Your dare has a new performer!`, req.userId);
      
      res.json({ message: 'You are now the performer for this dare.', dare });
    } catch (err) {
      // User-friendly error for cooldown or open dares limit
      if (
        err.message &&
        (err.message.includes('cooldown') || err.message.includes('maximum of 5 open dares'))
      ) {
        return res.status(429).json({
          error: 'You are in cooldown or have reached the maximum of 5 open dares. Please complete or forfeit some dares, or wait for your cooldown to expire.'
        });
      }
      res.status(500).json({ error: 'Failed to accept dare.' });
    }
  }
);

// POST /api/dares/:id/chicken-out - performer chickens out of a dare (alias for forfeit)
router.post('/:id/chicken-out',
  auth,
  require('express-validator').param('id').isMongoId(),
  (req, res, next) => {
    if (Object.keys(req.body).length > 0) {
      return res.status(400).json({ error: 'No body expected.' });
    }
    next();
  },
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (!dare.performer || dare.performer.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only the performer can chicken out of this dare.' });
      }
      if (dare.status !== 'in_progress') {
        return res.status(400).json({ error: 'Only in-progress dares can be chickened out of.' });
      }
      dare.status = 'forfeited';
      dare.updatedAt = new Date();
      await dare.save();
      // Notify creator
      await sendNotification(
        dare.creator,
        'dare_forfeited',
        'The performer has chickened out (forfeited) your dare. You may make it available again or create a new dare.',
        req.userId
      );
      // Log activity
      await logActivity({ type: 'dare_forfeited', user: req.userId, dare: dare._id });
      res.json({ message: 'Dare chickened out (forfeited).', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to chicken out of dare.' });
    }
  }
);

// POST /api/dares/:id/forfeit - performer forfeits (chickens out) of a dare
router.post('/:id/forfeit',
  auth,
  require('express-validator').param('id').isMongoId(),
  (req, res, next) => {
    if (Object.keys(req.body).length > 0) {
      return res.status(400).json({ error: 'No body expected.' });
    }
    next();
  },
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      if (!dare.performer || dare.performer.toString() !== req.userId) {
        return res.status(403).json({ error: 'Only the performer can forfeit this dare.' });
      }
      if (dare.status !== 'in_progress') {
        return res.status(400).json({ error: 'Only in-progress dares can be forfeited.' });
      }
      dare.status = 'forfeited';
      dare.updatedAt = new Date();
      await dare.save();
      // Notify creator
      await sendNotification(
        dare.creator,
        'dare_forfeited',
        'The performer has chickened out (forfeited) your dare. You may make it available again or create a new dare.',
        req.userId
      );
      // Log activity
      await logActivity({ type: 'dare_forfeited', user: req.userId, dare: dare._id });
      res.json({ message: 'Dare forfeited (chickened out).', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to forfeit dare.' });
    }
  }
);

// DELETE /api/dares/:id - only creator can delete
router.delete('/:id',
  require('express-validator').param('id').isMongoId(),
  auth,
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      // Fetch user to check admin role
      const user = await User.findById(req.userId);
      const isAdmin = user && user.roles && user.roles.includes('admin');
      if (dare.creator.toString() !== req.userId && !isAdmin) return res.status(403).json({ error: 'Only the creator or an admin can delete this dare.' });
      await dare.deleteOne();
      // Notify creator and performer if applicable
      await sendNotification(dare.creator, 'dare_deleted', `Your dare has been deleted.`, req.userId);
      if (dare.performer) {
        await sendNotification(dare.performer, 'dare_deleted', `A dare you were involved in has been deleted.`, req.userId);
      }
      res.json({ message: 'Dare deleted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete dare.' });
    }
  }
);

// POST /api/dares/:id/approve (admin/moderator)
router.post('/:id/approve',
  require('express-validator').param('id').isMongoId(),
  auth,
  checkPermission('approve_dare'),
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      await logAudit({ action: 'approve_dare', user: req.userId, target: req.params.id });
      // Notify performer if exists
      if (dare.performer) {
        await sendNotification(dare.performer, 'dare_approved', `Your dare "${dare.title}" has been approved.`, req.userId);
      }
      res.json({ message: 'Dare approved.', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to approve dare.' });
    }
  }
);

// POST /api/dares/:id/reject (admin/moderator)
router.post('/:id/reject',
  require('express-validator').param('id').isMongoId(),
  auth,
  checkPermission('reject_dare'),
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const dare = await Dare.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      await logAudit({ action: 'reject_dare', user: req.userId, target: req.params.id });
      // Notify performer if exists
      if (dare.performer) {
        await sendNotification(dare.performer, 'dare_rejected', `Your dare "${dare.title}" has been rejected.`, req.userId);
      }
      res.json({ message: 'Dare rejected.', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to reject dare.' });
    }
  }
);

// POST /api/dares/claimable - create a claimable dare (auth required)
router.post('/claimable',
  auth,
  [
    body('description').isString().isLength({ min: 5, max: 500 }).trim().escape(),
    body('difficulty').isString().isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']),
    body('tags').optional().isArray(),
    body('assignedSwitch').optional().isString(),
    body('dareType').optional().isString().isIn(['submission', 'domination', 'switch']),
    body('public').optional().isBoolean(),
    body('allowedRoles').optional().isArray(),
    body('contentDeletion').optional().isString().isIn(['delete_after_view', 'delete_after_30_days', 'never_delete']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { description, difficulty, tags, assignedSwitch, dareType, public: isPublic, allowedRoles, contentDeletion } = req.body;
      const claimToken = uuidv4();
      
      // OSA-style content expiration setup (automatic)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const dare = new Dare({
        description,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        creator: req.userId,
        assignedSwitch: assignedSwitch || undefined,
        status: 'waiting_for_participant',
        dareType: dareType || 'submission',
        public: isPublic !== undefined ? isPublic : true,
        allowedRoles: Array.isArray(allowedRoles) ? allowedRoles : [],
        contentDeletion: contentDeletion || 'delete_after_30_days',
        claimable: true,
        claimToken,
        // No content expiration - dares don't expire, only proofs do
      });
      await dare.save();
      await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
      await sendNotification(req.userId, 'dare_created', `Your claimable dare has been created.`, req.userId);
      res.status(201).json({ dare, claimLink: `${process.env.FRONTEND_URL || 'https://www.deviantdare.com'}/claim/${claimToken}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create claimable dare.' });
    }
  }
);

// GET /api/dares/share/:id - fetch dare by ID for sharing (public)
router.get('/share/:id', async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .populate('assignedSwitch', 'username fullName avatar');
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Only return public dares or dares created by the requesting user
    if (!dare.public) {
      return res.status(403).json({ error: 'This dare is private.' });
    }
    
    res.json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dare.' });
  }
});

// GET /api/dares/claim/:token - fetch dare by claimToken (public for unclaimed, auth required for claimed)
router.get('/claim/:token', async (req, res) => {
  try {
    const dare = await Dare.findOne({ claimToken: req.params.token })
      .populate('creator', 'username avatar age gender limits dob completedDares consentedDares');
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    
    // If dare is claimed, require authentication and verify performer
    if (!dare.claimable && dare.claimedBy) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required to access claimed dare.' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
        if (dare.claimedBy && dare.claimedBy.toString() !== decoded.id) {
          return res.status(403).json({ error: 'You can only access dares you have claimed.' });
        }
      } catch (jwtErr) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
      }
    }
    // Compute performer stats
    const creator = dare.creator;
    let age = null;
    if (creator.dob) {
      const dob = new Date(creator.dob);
      const diffMs = Date.now() - dob.getTime();
      age = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    }
    // Dares performed: completedDares.length
    const daresPerformed = Array.isArray(creator.completedDares) ? creator.completedDares.length : 0;
    // Dares created: count of dares with creator = user
    const daresCreated = await Dare.countDocuments({ creator: creator._id });
    // Average grade: average of all grades for dares created by user
    const dares = await Dare.find({ creator: creator._id });
    let grades = [];
    dares.forEach(d => {
      if (Array.isArray(d.grades)) grades = grades.concat(d.grades.map(g => g.grade));
    });
    const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;
    // Hard limits
    const limits = creator.limits || [];
    // Attach stats to creator
    const creatorInfo = {
      username: creator.username,
      avatar: creator.avatar,
      gender: creator.gender,
      age,
      daresPerformed,
      daresCreated,
      avgGrade,
      limits
    };
    // Add difficulty description
    let difficultyDescription = '';
    switch (dare.difficulty) {
      case 'titillating':
        difficultyDescription = 'Flirty, playful, and fun. Safe for most.';
        break;
      case 'arousing':
        difficultyDescription = 'Arousing and suggestive. For the bold.';
        break;
      case 'explicit':
        difficultyDescription = 'Explicit and revealing. For adults only.';
        break;
      case 'edgy':
        difficultyDescription = 'Pushes boundaries. Use with caution.';
        break;
      case 'hardcore':
        difficultyDescription = 'No holds barred. Use this with people you trust to safely approach your limits.';
        break;
      default:
        difficultyDescription = '';
    }
    res.json({
      ...dare.toObject(),
      creator: creatorInfo,
      difficultyDescription
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dare.' });
  }
});

// POST /api/dares/claim/:token - claim a dare by submitting a demand (public)
router.post('/claim/:token', [
  body('demand').isString().isLength({ min: 5, max: 1000 }).trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  try {
    const dare = await Dare.findOne({ claimToken: req.params.token, claimable: true });
    if (!dare) return res.status(404).json({ error: 'Claimable dare not found.' });
    if (dare.claimedBy) return res.status(400).json({ error: 'This dare has already been claimed.' });
    
    // OSA-style content expiration setup based on participant's choice
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    dare.claimedBy = null; // Optionally, set to req.userId if you want to require login
    dare.claimedAt = new Date();
    dare.claimDemand = req.body.demand;
    dare.status = 'in_progress';
    dare.claimable = false;
    // No content expiration - dares don't expire, only proofs do
    await dare.save();
    // Optionally notify the creator
    await sendNotification(dare.creator, 'dare_claimed', 'Your claimable dare has been claimed.', req.userId);
    res.json({ message: 'Dare claimed successfully.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim dare.' });
  }
});

// PATCH /api/dares/:id/start - start a dare (accept and begin)
router.patch('/:id/start', auth, [
      body('difficulty').optional().isString().isIn(['titillating', 'arousing', 'explicit', 'edgy', 'hardcore']).withMessage('Difficulty must be one of: titillating, arousing, explicit, edgy, hardcore.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { difficulty } = req.body;
    const dare = await Dare.findById(req.params.id);
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    if (dare.performer) {
      return res.status(400).json({ error: 'Dare already has a performer.' });
    }
    
    if (dare.creator.toString() === req.userId) {
      return res.status(400).json({ error: 'You cannot perform your own dare.' });
    }
    
    // Update dare with performer and difficulty
    const updates = { 
      performer: req.userId, 
      status: 'in_progress',
      updatedAt: new Date()
    };
    
    if (difficulty) {
      updates.difficulty = difficulty;
    }
    
    const updatedDare = await Dare.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('creator', 'username fullName avatar')
     .populate('performer', 'username fullName avatar');
    
    // Notify creator
    await sendNotification(dare.creator, 'dare_assigned', `Your dare has a new performer!`, req.userId);
    
    res.json(updatedDare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start dare.' });
  }
});

// GET /api/dares/random - get a random dare (auth required)
router.get('/random', auth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    const userId = req.userId;
    
    // Prevent claiming if in cooldown or at open dare limit
    await checkSlotAndCooldownAtomic(userId);
    
    // Exclude dares already consented to or completed by this user
    const user = await User.findById(userId).select('consentedDares completedDares');
    const excludeDares = [
      ...(user.consentedDares || []),
      ...(user.completedDares || [])
    ];
    
    const filter = {
      status: 'waiting_for_participant',
      performer: null,
      creator: { $ne: userId }
    };
    
    if (difficulty) filter.difficulty = difficulty;
    if (excludeDares.length > 0) filter._id = { $nin: excludeDares };
    
    const count = await Dare.countDocuments(filter);
    if (count === 0) {
      return res.json({});
    }
    
    const rand = Math.floor(Math.random() * count);
    const dareDoc = await Dare.find(filter).skip(rand).limit(1);
    
    if (!dareDoc.length) {
      return res.json({});
    }
    
    // Prevent creator from performing their own dare
    if (dareDoc[0].creator.toString() === userId) {
      return res.status(400).json({ error: 'You cannot perform your own dare.' });
    }
    
    // Blocked user check
    const creator = await User.findById(dareDoc[0].creator).select('blockedUsers');
    const performerUser = await User.findById(userId).select('blockedUsers');
    
    if (
      (creator.blockedUsers && performerUser.blockedUsers && creator.blockedUsers.includes(userId)) ||
      (creator.blockedUsers && performerUser.blockedUsers && performerUser.blockedUsers.includes(dareDoc[0].creator.toString()))
    ) {
      return res.status(400).json({ error: 'You cannot perform this dare due to user blocking.' });
    }
    
    const dare = dareDoc[0].populate('creator', 'username fullName avatar');
    res.json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get random dare.' });
  }
});

// POST /api/dares/:id/accept - accept a dare
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id);
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    if (dare.performer) {
      return res.status(400).json({ error: 'Dare already has a performer.' });
    }
    
    if (dare.creator.toString() === req.userId) {
      return res.status(400).json({ error: 'You cannot accept your own dare.' });
    }
    
    // OSA-style content expiration setup based on participant's choice
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // Update dare with performer and content expiration
    const updatedDare = await Dare.findByIdAndUpdate(
      req.params.id,
      { 
        performer: req.userId, 
        status: 'in_progress',
        // No content expiration - dares don't expire, only proofs do
        updatedAt: new Date()
      },
      { new: true }
    ).populate('creator', 'username fullName avatar')
     .populate('performer', 'username fullName avatar');
    
    // Notify creator
    await sendNotification(dare.creator, 'dare_assigned', `Your dare has a new performer!`, req.userId);
    
    res.json(updatedDare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept dare.' });
  }
});

// POST /api/dares/:id/reject - reject a dare
router.post('/:id/reject', auth, [
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { reason } = req.body;
    const dare = await Dare.findById(req.params.id);
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    if (dare.performer?.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the performer can reject this dare.' });
    }
    
    // Update dare status
    const updatedDare = await Dare.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('creator', 'username fullName avatar')
     .populate('performer', 'username fullName avatar');
    
    // Notify creator
    await sendNotification(dare.creator, 'dare_rejected', `Your dare has been rejected.`, req.userId);
    
    res.json(updatedDare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject dare.' });
  }
});

// POST /api/dares/:id/reject - reject a dare (admin/moderator)
router.post('/:id/reject', auth, [
  body('reason').optional().isString().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { reason } = req.body;
    const dare = await Dare.findById(req.params.id);
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    if (dare.performer?.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the performer can reject this dare.' });
    }
    
    // Update dare status
    const updatedDare = await Dare.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('creator', 'username fullName avatar')
     .populate('performer', 'username fullName avatar');
    
    // Notify creator
    await sendNotification(dare.creator, 'dare_rejected', `Your dare has been rejected.`, req.userId);
    
    res.json(updatedDare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject dare.' });
  }
});

// POST /api/dares/:id/appeal - appeal a rejected dare
router.post('/:id/appeal', auth, [
  body('reason').isString().isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { reason } = req.body;
    const dare = await Dare.findById(req.params.id);
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    if (dare.performer?.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the performer can appeal this dare.' });
    }
    
    if (dare.status !== 'rejected') {
      return res.status(400).json({ error: 'Only rejected dares can be appealed.' });
    }
    
    // Create appeal
    const Appeal = require('../models/Appeal');
    const appeal = new Appeal({
      type: 'dare',
      targetId: dare._id,
      user: req.userId,
      reason
    });
    
    await appeal.save();
    await logAudit({ action: 'appeal_dare', user: req.userId, target: dare._id });
    
    // Update dare status to pending appeal
    dare.status = 'pending_appeal';
    dare.updatedAt = new Date();
    await dare.save();
    
    res.json({ message: 'Appeal submitted successfully.', appeal });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit appeal.' });
  }
});

// POST /api/dares/:id/approve - approve a dare (admin/moderator)
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const dare = await Dare.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', updatedAt: new Date() },
      { new: true }
    );
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Notify performer if exists
    if (dare.performer) {
      await sendNotification(dare.performer, 'dare_approved', `Your dare has been approved.`, req.userId);
    }
    
    res.json({ message: 'Dare approved successfully.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve dare.' });
  }
});

// POST /api/dares/:id/reject - reject a dare (admin/moderator)
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const dare = await Dare.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', updatedAt: new Date() },
      { new: true }
    );
    
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Notify performer if exists
    if (dare.performer) {
      await sendNotification(dare.performer, 'dare_rejected', `Your dare has been rejected.`, req.userId);
    }
    
    res.json({ message: 'Dare rejected successfully.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject dare.' });
  }
});

// PATCH /api/dares/:id/consent - record consent for dom demands (double-consent)
router.patch('/:id/consent', auth, async (req, res) => {
  try {
    const { consented, consentedAt } = req.body;
    
    const dare = await Dare.findById(req.params.id);
    if (!dare) {
      return res.status(404).json({ error: 'Dare not found.' });
    }
    
    // Only allow consent for dom demands that require it
    if (dare.dareType !== 'domination' || !dare.requiresConsent) {
      return res.status(400).json({ error: 'This dare does not require consent.' });
    }
    
    // Check if user is the intended recipient (claimed by them)
    if (dare.claimedBy && dare.claimedBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'You cannot consent to this dare.' });
    }
    
    // Update consent status
    dare.consented = consented || true;
    dare.consentedAt = consentedAt || new Date();
    dare.updatedAt = new Date();
    
    await dare.save();
    
    // Log activity
    await logActivity(req.userId, 'dare_consented', `Consented to view dom demand`, dare._id);
    
    res.json({ 
      message: 'Consent recorded successfully.', 
      dare: {
        _id: dare._id,
        description: dare.description, // Now reveal the full description
        difficulty: dare.difficulty,
        dareType: dare.dareType,
        consented: dare.consented,
        consentedAt: dare.consentedAt
      }
    });
  } catch (err) {
    console.error('Consent error:', err);
    res.status(500).json({ error: 'Failed to record consent.' });
  }
});

// POST /api/dares/cleanup-expired - cleanup expired proofs (admin only)
router.post('/cleanup-expired', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const now = new Date();
    
    // Find dares with expired proofs
    const daresWithExpiredProofs = await Dare.find({
      proofExpiresAt: { $lt: now },
      proof: { $exists: true, $ne: null }
    });

    let updatedCount = 0;

    for (const dare of daresWithExpiredProofs) {
      // Clear expired proof but keep the dare
      await Dare.findByIdAndUpdate(dare._id, { 
        proof: null,
        proofExpiresAt: null,
        updatedAt: now
      });
      updatedCount++;
    }

    res.json({ 
      message: 'Proof cleanup completed successfully.',
      updated: updatedCount,
      total: daresWithExpiredProofs.length
    });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ error: 'Failed to cleanup expired proofs.' });
  }
});

module.exports = router;
module.exports.checkSlotAndCooldownAtomic = checkSlotAndCooldownAtomic; 