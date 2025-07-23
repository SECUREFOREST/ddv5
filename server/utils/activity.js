// Activity logging utility for dares, comments, grades, etc.
const Activity = require('../models/Activity');

async function logActivity({ type, user, dare, switchGame, comment, details }) {
  try {
    await Activity.create({
      type,
      user,
      dare,
      switchGame,
      comment,
      details,
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

module.exports = { logActivity }; 