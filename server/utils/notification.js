const Notification = require('../models/Notification');
// Import userSockets from server.js
let userSockets;
try {
  userSockets = require('../server').userSockets;
} catch (e) {
  userSockets = null;
}

async function sendNotification(user, type, message, sender = null, maxRetries = 2) {
  let attempt = 0;
  let lastError = null;
  let notification = null;
  while (attempt <= maxRetries) {
    try {
      notification = await Notification.create({ user, type, message, sender });
      break;
    } catch (err) {
      lastError = err;
      console.error(`Failed to send notification (attempt ${attempt + 1}):`, err);
      attempt++;
    }
  }
  if (!notification) return false;
  // Emit real-time event if user is connected
  if (userSockets && userSockets.has(user.toString())) {
    const socket = userSockets.get(user.toString());
    socket.emit('notification', {
      _id: notification._id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      sender: notification.sender,
    });
  }
  return true;
}

module.exports = { sendNotification }; 