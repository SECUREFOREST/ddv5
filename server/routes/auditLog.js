const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { checkPermission } = require('../utils/permissions');

// GET /audit-log - list all audit logs (admin only)
router.get('/', auth, checkPermission('view_audit_log'), async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await AuditLog.countDocuments();
    
    // Get paginated audit logs
    const logs = await AuditLog.find()
      .populate('user', 'username email')
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router; 