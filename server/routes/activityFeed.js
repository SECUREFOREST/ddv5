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
    
    // Find all dares and switch games where the user is creator, performer, or assignedSwitch
    const dares = await Dare.find({
      $or: [
        { creator: userId },
        { performer: userId },
        { assignedSwitch: userId }
      ]
    }).select('_id');
    const switchGames = await SwitchGame.find({
      $or: [
        { creator: userId },
        { participant: userId }
      ]
    }).select('_id');
    const relevantDareIds = dares.map(d => d._id);
    const relevantSwitchGameIds = switchGames.map(g => g._id);

    // Build the filter for activities
    const filter = {
      $or: [
        { user: userId },
        { dare: { $in: relevantDareIds } },
        { switchGame: { $in: relevantSwitchGameIds } }
      ]
    };

    // Get total count for pagination
    const totalActivities = await Activity.countDocuments(filter);

    // Find activities with pagination
    const activities = await Activity.find(filter)
      .populate('user', 'username avatar')
      .populate('switchGame', 'description difficulty creator participant status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Set total count header for client-side pagination
    res.set('X-Total-Count', totalActivities.toString());
    
    res.json({
      activities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        totalPages: Math.ceil(totalActivities / limit),
        hasNextPage: page * limit < totalActivities,
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