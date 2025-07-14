const express = require('express');
const router = express.Router();
const Appeal = require('../models/Appeal');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const { checkPermission } = require('../utils/permissions');
const { body, validationResult, param } = require('express-validator');

// Middleware to check admin
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// POST /appeals - user submits an appeal
router.post('/',
  [
    body('type').isString().isIn(['unblock', 'refund', 'dare']),
    body('targetId').isMongoId(),
    body('reason').isString().isLength({ min: 5, max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { type, targetId, reason } = req.body;
      const userId = req.user?.id;
      if (!userId || !type || !reason) return res.status(400).json({ error: 'All fields required.' });
      const appeal = new Appeal({ type, targetId, user: userId, reason });
      await appeal.save();
      res.json({ message: 'Appeal submitted.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit appeal.' });
    }
  }
);

// GET /appeals - admin lists all appeals
router.get('/', requireAdmin, async (req, res) => {
  try {
    const appeals = await Appeal.find().populate('user', 'username email').sort({ createdAt: -1 });
    res.json(appeals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appeals.' });
  }
});

// PATCH /appeals/:id - admin resolves an appeal
router.patch('/:id',
  [param('id').isMongoId(), body('outcome').isString().isLength({ min: 2, max: 200 }).trim().escape()],
  requireAdmin,
  checkPermission('resolve_appeal'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { outcome } = req.body;
      const appeal = await Appeal.findById(req.params.id);
      if (!appeal) return res.status(404).json({ error: 'Appeal not found.' });
      appeal.status = 'resolved';
      appeal.outcome = outcome;
      appeal.resolvedBy = req.user.id;
      appeal.resolvedAt = new Date();
      await appeal.save();
      await logAudit({ action: 'resolve_appeal', user: req.user.id, target: req.params.id, details: { outcome } });
      res.json({ message: 'Appeal resolved.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to resolve appeal.' });
    }
  }
);

module.exports = router; 