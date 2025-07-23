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

    // Find activities related to these dares or switch games, or created by the user
    const activities = await Activity.find({
      $or: [
        { user: userId },
        { dare: { $in: relevantDareIds } },
        { switchGame: { $in: relevantSwitchGameIds } }
      ]
    })
      .populate('user', 'username avatar')
      .populate('switchGame', 'description difficulty creator participant status')
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 30);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load activity feed.' });
  }
});

module.exports = router; 