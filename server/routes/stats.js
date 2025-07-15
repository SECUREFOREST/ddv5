const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Dare = require('../models/Dare');
const auth = require('../middleware/auth');
const { query, param, validationResult } = require('express-validator');

// GET /api/stats/leaderboard - top users by dares created
router.get('/leaderboard', auth, async (req, res) => {
  try {
    // Aggregate users by number of dares created
    const topUsers = await Dare.aggregate([
      { $group: { _id: '$creator', daresCount: { $sum: 1 } } },
      { $sort: { daresCount: -1 } },
      { $limit: 10 },
    ]);
    // Populate user info
    const users = await User.find({ _id: { $in: topUsers.map(u => u._id) } }, 'username avatar');
    // Fetch blocked users for filtering
    const currentUser = await User.findById(req.userId).select('blockedUsers');
    // Merge stats
    let leaderboard = topUsers.map(u => {
      const user = users.find(us => us._id.toString() === (u._id ? u._id.toString() : ''));
      return {
        user: user ? { id: user._id, username: user.username, avatar: user.avatar } : { id: null, username: '[deleted]', avatar: null },
        daresCount: u.daresCount,
      };
    });
    if (currentUser && currentUser.blockedUsers && currentUser.blockedUsers.length > 0) {
      leaderboard = leaderboard.filter(entry => entry.user && entry.user.id && !currentUser.blockedUsers.map(bu => bu.toString()).includes(entry.user.id.toString()));
    }
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

// GET /api/stats/users/:id - user stats
router.get('/users/:id',
  param('id').isMongoId().withMessage('User ID must be a valid MongoDB ObjectId.'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const userId = req.params.id;
      const daresCount = await Dare.countDocuments({ creator: userId });
      // Grades: average grade given to user's dares
      const dares = await Dare.find({ creator: userId });
      let grades = [];
      dares.forEach(dare => {
        if (Array.isArray(dare.grades)) grades = grades.concat(dare.grades.map(g => g.grade));
      });
      const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;
      res.json({
        daresCount,
        avgGrade,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user stats.' });
    }
  }
);

// GET /api/stats/activities - recent user activities (dares, grades)
router.get('/activities',
  [
    query('userId').isMongoId().withMessage('User ID must be a valid MongoDB ObjectId.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be an integer between 1 and 100.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }
    try {
      const { userId, limit = 10 } = req.query;
      const mongoose = require('mongoose');
      const uid = new mongoose.Types.ObjectId(userId);
      // Recent dares created
      const dares = await require('../models/Dare').find({ creator: uid })
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .select('description createdAt')
        .lean();
      // Recent grades given
      const daresWithGrades = await require('../models/Dare').find({ 'grades.user': uid })
        .sort({ updatedAt: -1 })
        .limit(Number(limit))
        .select('description grades updatedAt')
        .lean();
      const grades = [];
      daresWithGrades.forEach(dare => {
        (dare.grades || []).forEach(g => {
          if (g.user && g.user.toString() === userId) {
            grades.push({
              dare: { _id: dare._id, description: dare.description },
              grade: g.grade,
              feedback: g.feedback,
              updatedAt: dare.updatedAt
            });
          }
        });
      });
      // Merge and sort all activities by date
      const activities = [
        ...dares.map(d => ({ type: 'dare', description: d.description, createdAt: d.createdAt })),
        ...grades.map(g => ({ type: 'grade', dare: g.dare, grade: g.grade, feedback: g.feedback, createdAt: g.updatedAt }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, Number(limit));
      res.json(activities);
    } catch (err) {
      console.error('Failed to get activities:', err);
      res.status(500).json({ error: 'Failed to get activities.' });
    }
  }
);

module.exports = router; 