const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Act = require('../models/Act');
const Credit = require('../models/Credit');

// GET /api/stats/leaderboard - top users by acts created
router.get('/leaderboard', async (req, res) => {
  try {
    // Aggregate users by number of acts created
    const topUsers = await Act.aggregate([
      { $group: { _id: '$creator', actsCount: { $sum: 1 } } },
      { $sort: { actsCount: -1 } },
      { $limit: 10 },
    ]);
    // Populate user info
    const users = await User.find({ _id: { $in: topUsers.map(u => u._id) } }, 'username avatar');
    // Merge stats
    const leaderboard = topUsers.map(u => {
      const user = users.find(us => us._id.toString() === u._id.toString());
      return {
        user: user ? { id: user._id, username: user.username, avatar: user.avatar } : null,
        actsCount: u.actsCount,
      };
    });
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard.' });
  }
});

// GET /api/stats/users/:id - user stats
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const actsCount = await Act.countDocuments({ creator: userId });
    const credits = await Credit.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    // Grades: average grade given to user's acts
    const acts = await Act.find({ creator: userId });
    let grades = [];
    acts.forEach(act => {
      if (Array.isArray(act.grades)) grades = grades.concat(act.grades.map(g => g.grade));
    });
    const avgGrade = grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;
    res.json({
      actsCount,
      totalCredits: credits[0] ? credits[0].total : 0,
      avgGrade,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user stats.' });
  }
});

// GET /api/stats/activities - recent user activities (acts, comments, grades)
router.get('/activities', async (req, res) => {
  try {
    const { userId, limit = 10 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });
    const mongoose = require('mongoose');
    const uid = mongoose.Types.ObjectId(userId);
    // Recent acts created
    const acts = await require('../models/Act').find({ creator: uid })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('title createdAt')
      .lean();
    // Recent comments made
    const comments = await require('../models/Comment').find({ author: uid })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('text act createdAt')
      .populate('act', 'title')
      .lean();
    // Recent grades given
    const actsWithGrades = await require('../models/Act').find({ 'grades.user': uid })
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .select('title grades updatedAt')
      .lean();
    const grades = [];
    actsWithGrades.forEach(act => {
      (act.grades || []).forEach(g => {
        if (g.user && g.user.toString() === userId) {
          grades.push({
            act: { _id: act._id, title: act.title },
            grade: g.grade,
            feedback: g.feedback,
            updatedAt: act.updatedAt
          });
        }
      });
    });
    // Merge and sort all activities by date
    const activities = [
      ...acts.map(a => ({ type: 'act', title: a.title, createdAt: a.createdAt })),
      ...comments.map(c => ({ type: 'comment', text: c.text, act: c.act, createdAt: c.createdAt })),
      ...grades.map(g => ({ type: 'grade', act: g.act, grade: g.grade, feedback: g.feedback, createdAt: g.updatedAt }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, Number(limit));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get activities.' });
  }
});

module.exports = router; 