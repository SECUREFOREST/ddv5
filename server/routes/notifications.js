const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/notifications - list notifications for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list notifications.' });
  }
});

// POST /api/notifications/read - mark notifications as read
router.post('/read',
  auth,
  [
    body('ids').optional().isArray(),
    body('ids.*').optional().isMongoId(),
    body('all').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    try {
      const { ids, all } = req.body;
      let result;
      if (all) {
        result = await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
      } else if (Array.isArray(ids) && ids.length > 0) {
        result = await Notification.updateMany({ user: req.userId, _id: { $in: ids } }, { $set: { read: true } });
      } else {
        return res.status(400).json({ error: 'Provide ids array or all=true.' });
      }
      res.json({ message: 'Notifications marked as read.', result });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mark notifications as read.' });
    }
  }
);

module.exports = router; 