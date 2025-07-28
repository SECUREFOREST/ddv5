const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { checkPermission } = require('../utils/permissions');

// Middleware to check admin
function requireAdmin(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  User.findById(req.userId).then(user => {
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    req.user = user;
    next();
  }).catch(err => {
    res.status(500).json({ error: 'Failed to verify admin status.' });
  });
}

// GET /audit-log - list all audit logs (admin only)
router.get('/', requireAdmin, checkPermission('view_audit_log'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'username email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router; 