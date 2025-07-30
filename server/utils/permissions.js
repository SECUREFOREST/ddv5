// Permissions matrix: action -> roles allowed
const permissions = {
  'view_users': ['admin', 'moderator'],
  'delete_user': ['admin'],
  'ban_user': ['admin', 'moderator'],
  'approve_dare': ['admin', 'moderator'],
  'reject_dare': ['admin', 'moderator'],
  'view_audit_log': ['admin'],
  'resolve_report': ['admin', 'moderator'],
  'resolve_appeal': ['admin'],
  'bulk_operations': ['admin'],
  'view_site_stats': ['admin'],
  'manage_switch_games': ['admin'],
  // Add more as needed
};

const User = require('../models/User');

function checkPermission(action) {
  return async (req, res, next) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }
      const userRoles = user.roles || [];
      const allowedRoles = permissions[action] || [];
      if (!allowedRoles.some(role => userRoles.includes(role))) {
        return res.status(403).json({ error: 'Insufficient permissions.' });
      }
      req.user = user;
      next();
    } catch (err) {
      res.status(500).json({ error: 'Failed to verify permissions.' });
    }
  };
}

module.exports = { checkPermission }; 