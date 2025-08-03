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
    
    // Build filter for search
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { action: { $regex: req.query.search, $options: 'i' } },
        { details: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await AuditLog.countDocuments(filter);
    
    // Validate page number
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages && totalPages > 0) {
      return res.json({
        logs: [],
        limit,
        total,
        pages: totalPages
      });
    }
    
    // Get paginated audit logs
    const logs = await AuditLog.find(filter)
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
    console.error('Audit log error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

module.exports = router; 