const Notification = require('../models/Notification');

async function sendNotification(user, type, message, maxRetries = 2) {
  let attempt = 0;
  let lastError = null;
  while (attempt <= maxRetries) {
    try {
      await Notification.create({ user, type, message });
      return true;
    } catch (err) {
      lastError = err;
      console.error(`Failed to send notification (attempt ${attempt + 1}):`, err);
      attempt++;
    }
  }
  // Optionally, log to external service or alert admin
  return false;
}

module.exports = { sendNotification }; 