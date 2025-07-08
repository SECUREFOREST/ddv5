const Activity = require('../models/Activity');

async function logActivity({ type, user, act, comment, details }) {
  try {
    await Activity.create({
      type,
      user,
      act,
      comment,
      details,
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

module.exports = { logActivity }; 