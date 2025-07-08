const AuditLog = require('../models/AuditLog');

async function logAudit({ action, user, target, details }) {
  try {
    await AuditLog.create({
      action,
      user,
      target,
      details,
    });
  } catch (err) {
    // Optionally log to console or external service
    console.error('Failed to log audit action:', err);
  }
}

module.exports = { logAudit }; 