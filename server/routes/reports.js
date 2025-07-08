const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLog');
const { checkPermission } = require('../utils/permissions');

// Middleware to check admin
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

// GET /reports - list all reports
router.get('/', requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find().populate('reporter', 'username email').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// PATCH /reports/:id - resolve a report
router.patch('/:id', requireAdmin, checkPermission('resolve_report'), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    report.status = 'resolved';
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();
    await logAudit({ action: 'resolve_report', user: req.user.id, target: req.params.id });
    res.json({ message: 'Report resolved.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to resolve report.' });
  }
});

module.exports = router; 