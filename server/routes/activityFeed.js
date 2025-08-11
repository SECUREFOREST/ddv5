const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Dare = require('../models/Dare');
const SwitchGame = require('../models/SwitchGame');
const auth = require('../middleware/auth');

// GET /activity-feed - relevant activities for the logged-in user (dares, comments, grades, etc.)
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get activities where the user is directly involved
    let activities = [];
    let totalActivities = 0;
    
    // First, get activities created by the user
    const userActivities = await Activity.find({ user: userId })
      .populate('user', 'username avatar')
      .populate('switchGame', 'description difficulty creator participant status')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 });
    
    // Get activities related to dares where user is creator or performer
    const userDares = await Dare.find({
      $or: [{ creator: userId }, { performer: userId }]
    }).select('_id');
    
    const dareActivities = await Activity.find({
      dare: { $in: userDares.map(d => d._id) },
      user: { $ne: userId } // Exclude user's own activities (already included above)
    })
      .populate('user', 'username avatar')
      .populate('switchGame', 'description difficulty creator participant status')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 });
    
    // Get activities related to switch games where user is creator or participant
    const userSwitchGames = await SwitchGame.find({
      $or: [{ creator: userId }, { participant: userId }]
    }).select('_id');
    
    const switchGameActivities = await Activity.find({
      switchGame: { $in: userSwitchGames.map(g => g._id) },
      user: { $ne: userId } // Exclude user's own activities
    })
      .populate('user', 'username avatar')
      .populate('switchGame', 'description difficulty creator participant status')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 });
    
    // Combine and sort all activities
    activities = [...userActivities, ...dareActivities, ...switchGameActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    totalActivities = activities.length;
    
    // Apply pagination
    const startIndex = skip;
    const endIndex = startIndex + limit;
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    res.json({
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        totalPages: Math.ceil(totalActivities / limit),
        hasNextPage: endIndex < totalActivities,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    console.error('Activity feed error:', err);
    res.status(500).json({ error: 'Failed to load activity feed.' });
  }
});

// GET /activities - get activities for dashboard
router.get('/activities', auth, async (req, res) => {
  try {
    const { limit = 20, userId, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let filter = {};
    
    if (userId) {
      filter.user = userId;
    }
    
    // Get total count
    const totalActivities = await Activity.countDocuments(filter);
    
    const activities = await Activity.find(filter)
      .populate('user', 'username fullName avatar')
      .populate('dare', 'description difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalActivities,
        totalPages: Math.ceil(totalActivities / parseInt(limit)),
        hasNextPage: parseInt(page) * parseInt(limit) < totalActivities,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('Activities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities.' });
  }
});

module.exports = router; 