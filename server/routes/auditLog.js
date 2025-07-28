const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { checkPermission } = require('../utils/permissions');

// GET /audit-log - list all audit logs (admin only)
router.get('/', checkPermission('view_audit_log'), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('user', 'username email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router; 