const express = require('express');
const router = express.Router();
const Act = require('../models/Act');
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
  // Use findOneAndUpdate to atomically check and update openActs and cooldown
  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      $or: [
        { actCooldownUntil: { $exists: false } },
        { actCooldownUntil: { $lte: now } }
      ],
      openActs: { $lt: 5 }
    },
    { $inc: { openActs: 1 } },
    { new: true }
  );
  if (!user) {
    throw new Error('You are in cooldown or have reached the maximum of 5 open acts.');
  }
}

// GET /api/acts - list acts (optionally filter by status, difficulty, public, actType, allowedRoles)
router.get('/', async (req, res, next) => {
  try {
    const { status, difficulty, public: isPublic, actType, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (isPublic !== undefined) filter.public = isPublic === 'true';
    if (actType) filter.actType = actType;
    if (role) filter.$or = [
      { allowedRoles: { $exists: false } },
      { allowedRoles: { $size: 0 } },
      { allowedRoles: role }
    ];
    const acts = await Act.find(filter)
      .populate('creator', 'username avatar')
      .populate({ path: 'comments', select: 'author text createdAt', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    res.json(acts);
  } catch (err) {
    next(err);
  }
});

// GET /api/acts/:id - get act details
router.get('/:id', async (req, res) => {
  try {
    const act = await Act.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate({ path: 'comments', select: 'author text createdAt', populate: { path: 'author', select: 'username avatar' } });
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    res.json(act);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get act.' });
  }
});

// POST /api/acts - create act (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, difficulty, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const act = new Act({
      title,
      description,
      difficulty,
      tags: Array.isArray(tags) ? tags : [],
      creator: req.userId,
    });
    await act.save();
    await logActivity({ type: 'act_created', user: req.userId, act: act._id });
    // Notify the creator
    await sendNotification(req.userId, 'act_created', `Your act "${title}" has been created.`);
    res.status(201).json(act);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create act.' });
  }
});

// PATCH /api/acts/:id - update act (auth required, only creator)
router.patch('/:id', auth, async (req, res) => {
  try {
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    if (act.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const { title, description, difficulty, status, tags } = req.body;
    if (title) act.title = title;
    if (description) act.description = description;
    if (difficulty) act.difficulty = difficulty;
    if (status) act.status = status;
    if (tags) act.tags = Array.isArray(tags) ? tags : [];
    act.updatedAt = new Date();
    await act.save();
    res.json(act);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update act.' });
  }
});

// POST /api/acts/:id/grade - grade an act (auth required)
router.post('/:id/grade', auth, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    act.grades = act.grades || [];
    act.grades.push({ user: req.userId, grade, feedback });
    await act.save();
    await logActivity({ type: 'grade_given', user: req.userId, act: act._id, details: { grade, feedback } });
    // Notify performer if exists
    if (act.performer) {
      await sendNotification(act.performer, 'act_graded', `Your act "${act.title}" has been graded.`);
    }
    res.json({ message: 'Grade submitted.', act });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit grade.' });
  }
});

// POST /api/acts/:id/comment - add comment to act (auth required)
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    const comment = new Comment({
      act: act._id,
      author: req.userId,
      text,
    });
    await comment.save();
    act.comments.push(comment._id);
    await act.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// PATCH /api/acts/:id/start - start/accept an act (auth required, slot/cooldown enforced, role enforced)
router.patch('/:id/start', auth, async (req, res) => {
  try {
    await checkSlotAndCooldownAtomic(req.userId);
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    if (act.performer) return res.status(400).json({ error: 'Act already has a performer.' });
    // Role enforcement
    if (Array.isArray(act.allowedRoles) && act.allowedRoles.length > 0) {
      const user = await User.findById(req.userId);
      const hasRole = user.roles && user.roles.some(r => act.allowedRoles.includes(r));
      if (!hasRole) return res.status(403).json({ error: 'You do not have the required role to perform this act.' });
    }
    act.performer = req.userId;
    act.status = 'in_progress';
    act.updatedAt = new Date();
    await act.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { openActs: 1 } });
    res.json({ message: 'Act started.', act });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to start act.' });
  }
});

// POST /api/acts/:id/proof - submit proof (auth required, performer only, slot/cooldown enforced)
router.post('/:id/proof', auth, upload.single('file'), async (req, res) => {
  try {
    // Use UTC for all date calculations
    const now = new Date();
    await checkSlotAndCooldownAtomic(req.userId);
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    if (!act.performer || act.performer.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }
    const text = req.body.text || '';
    let fileUrl = null, fileName = null;
    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = `/uploads/${req.file.filename}`;
    }
    act.proof = { text, fileUrl, fileName };
    act.status = 'completed';
    act.updatedAt = now;
    act.proofExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now, UTC
    await act.save();
    await User.findByIdAndUpdate(req.userId, { $inc: { openActs: -1 } });
    // Notify creator
    await sendNotification(act.creator, 'proof_submitted', `Proof has been submitted for your act "${act.title}".`);
    res.json({ message: 'Proof submitted.', proof: act.proof });
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

// POST /acts/:id/accept - user consents to perform an act, optionally sets difficulty
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { difficulty } = req.body;
    const act = await Act.findById(req.params.id);
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    if (act.performer) return res.status(400).json({ error: 'Act already has a performer.' });
    if (!act.difficulty && difficulty) act.difficulty = difficulty;
    act.performer = req.userId;
    await act.save();
    res.json({ message: 'You are now the performer for this act.', act });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept act.' });
  }
});

// DELETE /api/acts/:id (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Act.findByIdAndDelete(req.params.id);
    res.json({ message: 'Act deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete act.' });
  }
});

// POST /api/acts/:id/approve (admin/moderator)
router.post('/:id/approve', auth, checkPermission('approve_act'), async (req, res) => {
  try {
    const act = await Act.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    await logAudit({ action: 'approve_act', user: req.userId, target: req.params.id });
    // Notify performer if exists
    if (act.performer) {
      await sendNotification(act.performer, 'act_approved', `Your act "${act.title}" has been approved.`);
    }
    res.json({ message: 'Act approved.', act });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve act.' });
  }
});

// POST /api/acts/:id/reject (admin/moderator)
router.post('/:id/reject', auth, checkPermission('reject_act'), async (req, res) => {
  try {
    const act = await Act.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!act) return res.status(404).json({ error: 'Act not found.' });
    await logAudit({ action: 'reject_act', user: req.userId, target: req.params.id });
    // Notify performer if exists
    if (act.performer) {
      await sendNotification(act.performer, 'act_rejected', `Your act "${act.title}" has been rejected.`);
    }
    res.json({ message: 'Act rejected.', act });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject act.' });
  }
});

module.exports = router; 