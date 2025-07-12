const express = require('express');
const router = express.Router();
const Dare = require('../models/Dare');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { logAudit } = require('../utils/auditLog');
const { logActivity } = require('../utils/activity');
const { checkPermission } = require('../utils/permissions');
const fs = require('fs');
const { sendNotification } = require('../utils/notification');
const { v4: uuidv4 } = require('uuid');

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
router.get('/', async (req, res, next) => {
  try {
    const { status, difficulty, public: isPublic, dareType, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (isPublic !== undefined) filter.public = isPublic === 'true';
    if (dareType) filter.dareType = dareType;
    if (role) filter.$or = [
      { allowedRoles: { $exists: false } },
      { allowedRoles: { $size: 0 } },
      { allowedRoles: role }
    ];
    const dares = await Dare.find(filter)
      .populate('creator', 'username avatar')
      .populate('performer', 'username avatar')
      .populate('assignedSwitch', 'username avatar')
      .populate({ path: 'comments', select: 'author text createdAt', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    res.json(dares);
  } catch (err) {
    next(err);
  }
});

// GET /api/dares/:id - get dare details
router.get('/:id', async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('performer', 'username avatar')
      .populate('assignedSwitch', 'username avatar')
      .populate({ path: 'comments', select: 'author text createdAt', populate: { path: 'author', select: 'username avatar' } });
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    res.json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dare.' });
  }
});

// Add after other GET endpoints
router.get('/random', auth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    const userId = req.userId;
    // Exclude dares already consented to or completed by this user
    const user = await require('../models/User').findById(userId).select('consentedDares completedDares');
    const excludeDares = [
      ...(user.consentedDares || []),
      ...(user.completedDares || [])
    ];
    const filter = { status: 'open', performer: { $exists: false } };
    if (difficulty) filter.difficulty = difficulty;
    if (excludeDares.length > 0) filter._id = { $nin: excludeDares };
    const count = await Dare.countDocuments(filter);
    if (count === 0) return res.json({});
    const rand = Math.floor(Math.random() * count);
    // Atomically assign the dare to this user if not already taken
    const dare = await Dare.findOneAndUpdate(
      filter,
      { performer: userId, status: 'in_progress', updatedAt: new Date() },
      { skip: rand, new: true }
    );
    if (!dare) return res.json({});
    // Track consent in user
    await require('../models/User').findByIdAndUpdate(userId, { $addToSet: { consentedDares: dare._id } });
    // Audit log
    await require('../utils/auditLog').logAudit({ action: 'consent_dare', user: userId, target: dare._id });
    res.json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch random dare.' });
  }
});

// POST /api/dares - create dare (auth required)
router.post('/', auth, async (req, res) => {
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
    });
    await dare.save();
    await logActivity({ type: 'dare_created', user: req.userId, dare: dare._id });
    // Notify the creator
    await sendNotification(req.userId, 'dare_created', `Your dare has been created.`);
    res.status(201).json(dare);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dare.' });
  }
});

// PATCH /api/dares/:id - update dare (auth required, only creator)
router.patch('/:id', auth, async (req, res) => {
  try {
    const dare = await Dare.findById(req.params.id);
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    if (dare.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { title, description, difficulty, status, tags, assignedSwitch } = req.body;
    if (title) dare.title = title;
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
});

// POST /api/dares/:id/grade - grade a dare (auth required)
router.post('/:id/grade', auth, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const dare = await Dare.findById(req.params.id);
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    dare.grades = dare.grades || [];
    dare.grades.push({ user: req.userId, grade, feedback });
    await dare.save();
    await logActivity({ type: 'grade_given', user: req.userId, dare: dare._id, details: { grade, feedback } });
    // Notify performer if exists
    if (dare.performer) {
      await sendNotification(dare.performer, 'dare_graded', `Your dare "${dare.title}" has been graded.`);
    }
    res.json({ message: 'Grade submitted.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit grade.' });
  }
});

// POST /api/dares/:id/comment - add comment to dare (auth required)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    const dare = await Dare.findById(req.params.id);
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    const comment = new Comment({
      dare: dare._id,
      author: req.userId,
      text,
    });
    await comment.save();
    dare.comments.push(comment._id);
    await dare.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// PATCH /api/dares/:id/start - start/accept a dare (auth required, slot/cooldown enforced, role enforced)
router.patch('/:id/start', auth, async (req, res) => {
  try {
    await checkSlotAndCooldownAtomic(req.userId);
    const dare = await Dare.findById(req.params.id);
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    if (dare.performer) return res.status(400).json({ error: 'Dare already has a performer.' });
    // Role enforcement
    if (Array.isArray(dare.allowedRoles) && dare.allowedRoles.length > 0) {
      const user = await User.findById(req.userId);
      const hasRole = user.roles && user.roles.some(r => dare.allowedRoles.includes(r));
      if (!hasRole) return res.status(403).json({ error: 'You do not have the required role to perform this dare.' });
    }
    dare.performer = req.userId;
    dare.status = 'in_progress';
    dare.updatedAt = new Date();
    await dare.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { openDares: 1 } });
    res.json({ message: 'Dare started.', dare });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to start dare.' });
  }
});

// POST /api/dares/:id/proof - submit proof (auth required, performer only, slot/cooldown enforced)
router.post('/:id/proof', auth, upload.single('file'), async (req, res) => {
  try {
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
});

// POST /dares/:id/accept - user consents to perform a dare, optionally sets difficulty
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { difficulty } = req.body;
    const dare = await Dare.findById(req.params.id);
    if (!dare) return res.status(404).json({ error: 'Dare not found.' });
    if (dare.performer) return res.status(400).json({ error: 'Dare already has a performer.' });
    if (!dare.difficulty && difficulty) dare.difficulty = difficulty;
    dare.performer = req.userId;
    await dare.save();
    res.json({ message: 'You are now the performer for this dare.', dare });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept dare.' });
  }
});

// DELETE /api/dares/:id (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Dare.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dare deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete dare.' });
  }
});

// POST /api/dares/:id/approve (admin/moderator)
router.post('/:id/approve', auth, checkPermission('approve_dare'), async (req, res) => {
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
});

// POST /api/dares/:id/reject (admin/moderator)
router.post('/:id/reject', auth, checkPermission('reject_dare'), async (req, res) => {
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
});

module.exports = router; 