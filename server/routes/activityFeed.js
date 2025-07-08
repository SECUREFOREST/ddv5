const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const Act = require('../models/Act');
const Comment = require('../models/Comment');

// GET /activity-feed - global activity feed (paginated)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username')
      .populate('act', 'title')
      .populate('comment', 'text');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity feed.' });
  }
});

module.exports = router; 