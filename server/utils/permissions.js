// Permissions matrix: action -> roles allowed
const permissions = {
  'view_users': ['admin', 'moderator'],
  'delete_user': ['admin'],
  'ban_user': ['admin', 'moderator'],
  'approve_act': ['admin', 'moderator'],
  'reject_act': ['admin', 'moderator'],
  'view_audit_log': ['admin'],
  'resolve_report': ['admin', 'moderator'],
  'resolve_appeal': ['admin'],
  // Add more as needed
};

function checkPermission(action) {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const allowedRoles = permissions[action] || [];
    if (!allowedRoles.some(role => userRoles.includes(role))) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { checkPermission }; 