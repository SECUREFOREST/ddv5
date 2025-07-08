const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

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
router.post('/read', auth, async (req, res) => {
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
});

module.exports = router; 