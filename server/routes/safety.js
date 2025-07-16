const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /safety/content_deletion - get user's content deletion setting
router.get('/content_deletion', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ value: user?.contentDeletion || '' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch content deletion setting.' });
  }
});

// POST /safety/content_deletion - update user's content deletion setting
router.post('/content_deletion', auth, async (req, res) => {
  const { value } = req.body;
  try {
    await User.findByIdAndUpdate(req.userId, { contentDeletion: value });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update content deletion setting.' });
  }
});

module.exports = router; 