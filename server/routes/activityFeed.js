const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
// const Dare = require('../models/Dare');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// GET /activity-feed - global activity feed (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    // Use stable sorting on createdAt and _id
    const activities = await Activity.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate('dare', 'title')
      .populate('comment', 'text');
    // Fetch blocked users for filtering
    const currentUser = await User.findById(req.userId).select('blockedUsers');
    const filteredActivities = currentUser && currentUser.blockedUsers && currentUser.blockedUsers.length > 0
      ? activities.filter(a => a.user && a.user._id && !currentUser.blockedUsers.map(bu => bu.toString()).includes(a.user._id.toString()))
      : activities;
    res.json(filteredActivities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
});

module.exports = router; 