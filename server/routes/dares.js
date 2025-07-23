console.log('Dares routes loaded');
const express = require('express');
const router = express.Router();
const Dare = require('../models/Dare');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { logAudit } = require('../utils/auditLog');
const { logActivity } = require('../utils/activity');
const { checkPermission } = require('../utils/permissions');
const fs = require('fs');
const { sendNotification } = require('../utils/notification');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
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
    const { status, difficulty, public: isPublic, dareType, role, creator, participant, assignedSwitch } = req.query;
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
    if (role) filter.$or = [
      { allowedRoles: { $exists: false } },
      { allowedRoles: { $size: 0 } },
      { allowedRoles: role }
    ];
    // Fetch blocked users for filtering
    const user = await User.findById(req.userId).select('blockedUsers');
    const dares = await Dare.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .populate('assignedSwitch', 'username fullName avatar')
      .sort({ createdAt: -1 });
    // Filter out dares involving blocked users
    const filteredDares = user && user.blockedUsers && user.blockedUsers.length > 0
      ? dares.filter(dare => {
          const ids = [dare.creator?._id?.toString(), dare.performer?._id?.toString(), dare.assignedSwitch?._id?.toString()];
          return !ids.some(id => id && user.blockedUsers.map(bu => bu.toString()).includes(id));
        })
      : dares;
    res.json(filteredDares);
  } catch (err) {
    next(err);
  }
});

// Add after other GET endpoints
router.get('/random', auth, async (req, res) => {
  console.log('--- /random endpoint hit ---');
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
    console.log('Random dare filter:', filter);
    console.log('Exclude dares:', excludeDares);
    const count = await Dare.countDocuments(filter);
    console.log('Matching dare count:', count);
    if (count === 0) {
      console.warn('No dares found matching filter:', filter);
      return res.json({});
    }
    const rand = Math.floor(Math.random() * count);
    // Find a random dare first
    const dareDoc = await Dare.find(filter).skip(rand).limit(1);
    if (!dareDoc.length) {
      console.warn('No dare could be assigned (possibly race condition), filter:', filter, 'rand:', rand);
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
      console.warn('No dare could be assigned (possibly race condition), filter:', filter, 'rand:', rand);
      return res.json({});
    }
    // Track consent in user
    await require('../models/User').findByIdAndUpdate(userId, { $addToSet: { consentedDares: dare._id } });
    // Audit log
    await require('../utils/auditLog').logAudit({ action: 'consent_dare', user: userId, target: dare._id });
    console.log('Returning dare:', dare);
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
    console.error('Error in /random endpoint:', err.message, err.stack);
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
    let userId;
    try {
      userId = mongoose.Types.ObjectId(req.userId);
    } catch (e) {
      console.error('[DEBUG] Invalid userId for ObjectId:', req.userId, e);
      return res.status(400).json({ error: 'Invalid user ID.' });
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
    console.log('[DEBUG] /dares/mine filter:', filter);
    const dares = await Dare.find(filter)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .sort({ updatedAt: -1 });
    res.json(dares);
  } catch (err) {
    console.error('[DEBUG] /dares/mine error:', err);
    res.status(500).json({ error: 'Failed to fetch your dares.' });
  }
});

// GET /api/dares/:id - get dare details
router.get('/:id', async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id)
      .populate('creator', 'username fullName avatar')
      .populate('performer', 'username fullName avatar')
      .populate('assignedSwitch', 'username fullName avatar');
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    // Ensure creator is always populated
    if (!dare.creator || !dare.creator.fullName) {
      // Try to fetch the user if only an ID is present
      if (dare.creator && typeof dare.creator === 'object' && dare.creator._id) {
        const user = await User.findById(dare.creator._id).select('username fullName avatar');
        dare.creator = user || null;
      } else if (dare.creator && typeof dare.creator === 'string') {
        const user = await User.findById(dare.creator).select('username fullName avatar');
        dare.creator = user || null;
      } else {
        dare.creator = null;
      }
    }
    res.json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dare.' });
  }
});

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
      const { description, difficulty, tags, assignedSwitch } = req.body;
      if (!description) return res.status(400).json({ error: 'Description is required.' });
      if (!difficulty) return res.status(400).json({ error: 'Difficulty is required.' });
      const dare = new Dare({
        description,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        creator: req.userId,
        assignedSwitch: assignedSwitch || undefined,
        status: 'waiting_for_participant', // Updated to match new status
      });
      await dare.save();
      await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
      // Notify the creator
      await sendNotification(req.userId, 'dare_created', `Your dare has been created.`);
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
    require('express-validator').body('difficulty').optional().isString().isIn(['titillating', 'daring', 'shocking']),
    require('express-validator').body('status').optional().isString().isIn(['waiting_for_participant', 'in_progress', 'completed', 'forfeited', 'approved', 'rejected']),
    require('express-validator').body('tags').optional().isArray(),
    require('express-validator').body('assignedSwitch').optional().isString().isLength({ min: 1 })
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
      const { description, difficulty, status, tags, assignedSwitch } = req.body;
      if (description) dare.description = description;
      if (difficulty) dare.difficulty = difficulty;
      if (status) dare.status = status;
      if (tags) dare.tags = Array.isArray(tags) ? tags : [];
      if (assignedSwitch !== undefined) dare.assignedSwitch = assignedSwitch;
      dare.updatedAt = new Date();
      await dare.save();
      res.json(dare);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update dare.' });
    }
  }
);

// POST /api/dares/:id/grade - grade a dare (auth required)
router.post('/:id/grade',
  auth,
  [
    body('grade').isInt({ min: 1, max: 10 }),
    body('feedback').optional().isString().isLength({ max: 500 }).trim().escape(),
    body('target').isString().isLength({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
        `You received a grade of ${grade} from ${graderUser?.username || 'someone'} for dare: "${dare.description}".`
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
      dare.proofExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now, UTC
      await dare.save();
      await User.findByIdAndUpdate(req.userId, { $inc: { openDares: -1 } });
      // Notify creator
      await sendNotification(dare.creator, 'proof_submitted', `Proof has been submitted for your dare "${dare.title}".`);
      res.json({ message: 'Proof submitted.', proof: dare.proof });
    } catch (err) {
      // If file was uploaded but DB update failed, delete the file
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn('Failed to clean up orphaned file:', req.file.path);
        }
      }
      res.status(400).json({ error: err.message || 'Failed to submit proof.' });
    }
  }
);

// POST /dares/:id/accept - user consents to perform a dare, optionally sets difficulty
router.post('/:id/accept',
  auth,
  [
    require('express-validator').param('id').isMongoId(),
    require('express-validator').body('difficulty').optional().isString().isIn(['titillating', 'daring', 'shocking'])
  ],
  async (req, res) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { difficulty } = req.body;
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
      if (!dare.difficulty && difficulty) dare.difficulty = difficulty;
      dare.performer = req.userId;
      dare.status = 'waiting_for_participant'; // Reset to available
      await dare.save();
      // Notify performer (the user accepting)
      await sendNotification(req.userId, 'dare_assigned', `You have been assigned as the performer for the dare: "${dare.description}"`);
      // Optionally notify creator
      await sendNotification(dare.creator, 'dare_assigned', `Your dare has a new performer!`);
      res.json({ message: 'You are now the performer for this dare.', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to accept dare.' });
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
      // Debug log for performer check
      console.log('Forfeit debug:', {
        dareId: dare._id,
        darePerformer: dare.performer ? dare.performer.toString() : dare.performer,
        reqUserId: req.userId
      });
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
        'The performer has chickened out (forfeited) your dare. You may make it available again or create a new dare.'
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
      await sendNotification(dare.creator, 'dare_deleted', `Your dare has been deleted.`);
      if (dare.performer) {
        await sendNotification(dare.performer, 'dare_deleted', `A dare you were involved in has been deleted.`);
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
        await sendNotification(dare.performer, 'dare_approved', `Your dare "${dare.title}" has been approved.`);
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
        await sendNotification(dare.performer, 'dare_rejected', `Your dare "${dare.title}" has been rejected.`);
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
    body('assignedSwitch').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { description, difficulty, tags, assignedSwitch } = req.body;
      const claimToken = uuidv4();
      const dare = new Dare({
        description,
        difficulty,
        tags: Array.isArray(tags) ? tags : [],
        creator: req.userId,
        assignedSwitch: assignedSwitch || undefined,
        status: 'waiting_for_participant',
        claimable: true,
        claimToken
      });
      await dare.save();
      await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
      await sendNotification(req.userId, 'dare_created', `Your claimable dare has been created.`);
      res.status(201).json({ dare, claimLink: `${process.env.FRONTEND_URL || 'https://www.deviantdare.com'}/claim/${claimToken}` });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create claimable dare.' });
    }
  }
);

// GET /api/dares/claim/:token - fetch dare by claimToken (public)
router.get('/claim/:token', async (req, res) => {
  try {
    const dare = await Dare.findOne({ claimToken: req.params.token, claimable: true })
      .populate('creator', 'username avatar age gender limits dob completedDares consentedDares');
    if (!dare) return res.status(404).json({ error: 'Claimable dare not found.' });
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
    res.status(500).json({ error: 'Failed to fetch claimable dare.' });
  }
});

// POST /api/dares/claim/:token - claim a dare by submitting a demand (public)
router.post('/claim/:token', [body('demand').isString().isLength({ min: 5, max: 1000 }).trim()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  try {
    const dare = await Dare.findOne({ claimToken: req.params.token, claimable: true });
    if (!dare) return res.status(404).json({ error: 'Claimable dare not found.' });
    if (dare.claimedBy) return res.status(400).json({ error: 'This dare has already been claimed.' });
    dare.claimedBy = null; // Optionally, set to req.userId if you want to require login
    dare.claimedAt = new Date();
    dare.claimDemand = req.body.demand;
    dare.status = 'in_progress';
    dare.claimable = false;
    await dare.save();
    // Optionally notify the creator
    await sendNotification(dare.creator, 'dare_claimed', 'Your claimable dare has been claimed.');
    res.json({ message: 'Dare claimed successfully.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim dare.' });
  }
});

module.exports = router;
module.exports.checkSlotAndCooldownAtomic = checkSlotAndCooldownAtomic; 