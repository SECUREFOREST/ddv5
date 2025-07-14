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
const upload = multer({ storage });

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
  // Use findOneAndUpdate to atomically check and update openDares and cooldown
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { actCooldownUntil: { $exists: false } },
        { actCooldownUntil: { $lte: now } }
      ],
      openDares: { $lt: 5 }
    },
    { $inc: { openDares: 1 } },
    { new: true }
  );
  if (!user) {
    throw new Error('You are in cooldown or have reached the maximum of 5 open dares.');
  }
}

// GET /api/dares - list dares (optionally filter by status, difficulty, public, dareType, allowedRoles)
router.get('/', auth, async (req, res, next) => {
  try {
    const { status, difficulty, public: isPublic, dareType, role, creator, participant, assignedSwitch } = req.query;
    const filter = {};
    if (status) filter.status = status;
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
      .populate('creator', 'username avatar')
      .populate('performer', 'username avatar')
      .populate('assignedSwitch', 'username avatar')
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
    // Exclude dares already consented to or completed by this user
    const user = await require('../models/User').findById(userId).select('consentedDares completedDares');
    const excludeDares = [
      ...(user.consentedDares || []),
      ...(user.completedDares || [])
    ];
    const filter = { status: 'waiting_for_participant', performer: null };
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
    console.error('Error in /random endpoint:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to get dare.' });
  }
});

// GET /api/dares/:id - get dare details
router.get('/:id', async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('performer', 'username avatar')
      .populate('assignedSwitch', 'username avatar');
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    // Ensure creator and performer are always present as objects (not just IDs)
    // If missing, try to fetch and attach them
    if (dare.creator && typeof dare.creator === 'string') {
      dare.creator = await User.findById(dare.creator).select('username avatar');
    }
    if (dare.performer && typeof dare.performer === 'string') {
      dare.performer = await User.findById(dare.performer).select('username avatar');
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
    body('description').isString().isLength({ min: 5, max: 500 }).trim().escape(),
    body('difficulty').isString().isIn(['titillating', 'daring', 'shocking']),
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
      const { grade, feedback, target } = req.body;
      if (!target) return res.status(400).json({ error: 'Target user is required for grading.' });
      const dare = await Dare.findById(req.params.id);
      if (!dare) return res.status(404).json({ error: 'Dare not found.' });
      dare.grades = dare.grades || [];
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
      await checkSlotAndCooldownAtomic(req.userId);
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
      res.json({ message: 'You are now the performer for this dare.', dare });
    } catch (err) {
      res.status(500).json({ error: 'Failed to accept dare.' });
    }
  }
);

// POST /api/dares/:id/forfeit - performer forfeits (chickens out) of a dare
router.post('/:id/forfeit',
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
      if (dare.creator.toString() !== req.userId) return res.status(403).json({ error: 'Only the creator can delete this dare.' });
      await dare.deleteOne();
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

module.exports = router; 