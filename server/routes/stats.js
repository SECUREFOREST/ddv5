const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { query, param, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const SwitchGame = require('../models/SwitchGame');
const Dare = require('../models/Dare');
const User = require('../models/User');

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
    const users = await User.find({ _id: { $in: topUsers.map(u => u._id) } }, 'username fullName avatar');
    // Fetch blocked users for filtering
    const currentUser = await User.findById(req.userId).select('blockedUsers');
    // Merge stats
    let leaderboard = topUsers.map(u => {
      const user = users.find(us => us._id.toString() === (u._id ? u._id.toString() : ''));
      return {
        user: user ? { id: user._id, username: user.username, fullName: user.fullName, avatar: user.avatar } : { id: null, username: '[deleted]', fullName: null, avatar: null },
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
      const natures = { dominant: { withEveryone: {}, withYou: {}, tasks: [] }, submissive: { withEveryone: {}, withYou: {}, tasks: [] } };
      dares.forEach(dare => {
        if (dare.dareType === 'domination') {
          natures.dominant.tasks.push(dare.description);
          if (dare.performer) {
            const key = dare.performer.toString();
            natures.dominant.withEveryone[key] = (natures.dominant.withEveryone[key] || 0) + 1;
          }
        } else if (dare.dareType === 'submission') {
          natures.submissive.tasks.push(dare.description);
          if (dare.creator) {
            const key = dare.creator.toString();
            natures.submissive.withEveryone[key] = (natures.submissive.withEveryone[key] || 0) + 1;
          }
        }
      });
      let dominantCount = 0, submissiveCount = 0;
      dares.forEach(dare => {
        if (dare.dareType === 'domination' && dare.creator && dare.creator.toString() === userId) {
          dominantCount++;
        }
        if (dare.dareType === 'submission' && dare.performer && dare.performer.toString() === userId) {
          submissiveCount++;
        }
        if (dare.dareType === 'switch') {
          if (dare.winner && dare.winner.toString() === userId) {
            dominantCount++;
          }
          if (dare.loser && dare.loser.toString() === userId) {
            submissiveCount++;
          }
        }
      });
      const totalCount = dominantCount + submissiveCount;
      const dominantPercent = totalCount ? Math.round((dominantCount / totalCount) * 100) : 0;
      const submissivePercent = totalCount ? Math.round((submissiveCount / totalCount) * 100) : 0;
      res.json({
        daresCount,
        avgGrade,
        dominantCount,
        submissiveCount,
        totalCount,
        dominantPercent,
        submissivePercent,
        natures,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user stats.' });
    }
  }
);

// GET /api/stats/activities - get activity feed
router.get('/activities', async (req, res) => {
  try {
    const { limit = 20, userId } = req.query;
    let filter = {};
    
    if (userId) {
      filter.user = userId;
    }
    
    const activities = await Activity.find(filter)
      .populate('user', 'username fullName avatar')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

// GET /api/stats/dashboard - general dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDares = await Dare.countDocuments();
    // If you have a Comment model, include it; otherwise, skip or add your own
    let totalComments = 0;
    try {
      totalComments = await require('../models/Comment').countDocuments();
    } catch {}
    res.json({
      totalUsers,
      totalDares,
      totalComments,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get dashboard stats.' });
  }
});

// GET /api/stats/public-dares - get public dare counts
router.get('/public-dares', async (req, res) => {
  try {
    const [totalDares, submissionDares, dominationDares, switchGames] = await Promise.all([
      Dare.countDocuments({ public: true, status: 'waiting_for_participant' }),
      Dare.countDocuments({ public: true, status: 'waiting_for_participant', dareType: 'submission' }),
      Dare.countDocuments({ public: true, status: 'waiting_for_participant', dareType: 'domination' }),
      SwitchGame.countDocuments({ public: true, status: 'waiting_for_participant' })
    ]);
    
    res.json({
      total: totalDares + switchGames,
      submission: submissionDares,
      domination: dominationDares,
      switch: switchGames
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public dare counts.' });
  }
});

// GET /api/stats/site - get site-wide statistics for admin dashboard
router.get('/site', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const [
      totalUsers,
      totalDares,
      totalSwitchGames,
      activeDares,
      completedDares,
      totalComments
    ] = await Promise.all([
      User.countDocuments(),
      Dare.countDocuments(),
      SwitchGame.countDocuments(),
      Dare.countDocuments({ status: { $in: ['in_progress', 'waiting_for_participant'] } }),
      Dare.countDocuments({ status: 'completed' }),
      require('../models/Comment').countDocuments().catch(() => 0)
    ]);

    res.json({
      totalUsers,
      totalDares,
      totalSwitchGames,
      activeDares,
      completedDares,
      totalComments,
      completionRate: totalDares > 0 ? Math.round((completedDares / totalDares) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch site statistics.' });
  }
});

module.exports = router; 