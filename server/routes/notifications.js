const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// GET /api/notifications - list notifications for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'fullName username avatar');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list notifications.' });
  }
});

// PUT /api/notifications/:id/read - mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }
    
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
});

// POST /api/notifications/read - mark multiple notifications as read
router.post('/read', auth, [
  body('ids').optional().isArray().withMessage('Ids must be an array.'),
  body('all').optional().isBoolean().withMessage('All must be a boolean.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { ids, all } = req.body;
    
    if (all) {
      // Mark all notifications as read
      await Notification.updateMany(
        { user: req.userId, read: false },
        { read: true }
      );
    } else if (ids && ids.length > 0) {
      // Mark specific notifications as read
      await Notification.updateMany(
        { _id: { $in: ids }, user: req.userId },
        { read: true }
      );
    } else {
      return res.status(400).json({ error: 'Either ids array or all=true must be provided.' });
    }
    
    res.json({ message: 'Notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

module.exports = router; 