const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkPermission } = require('../utils/permissions');
const { logAudit } = require('../utils/auditLog');
const User = require('../models/User');
const Dare = require('../models/Dare');
const SwitchGame = require('../models/SwitchGame');
const Report = require('../models/Report');
const Appeal = require('../models/Appeal');

// POST /api/bulk/users - bulk user operations
router.post('/users', auth, checkPermission('delete_user'), async (req, res) => {
  try {
    const { action, userIds } = req.body;
    
    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'Invalid request. Action and userIds array required.' });
    }
    
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const userId of userIds) {
      try {
        if (action === 'delete') {
          await User.findByIdAndDelete(userId);
          await logAudit({ action: 'bulk_delete_user', user: req.userId, target: userId });
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ userId, error: 'Invalid action' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ userId, error: error.message });
      }
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk user operation.' });
  }
});

// POST /api/bulk/dares - bulk dare operations
router.post('/dares', auth, checkPermission('approve_dare'), async (req, res) => {
  try {
    const { action, dareIds } = req.body;
    
    if (!action || !dareIds || !Array.isArray(dareIds)) {
      return res.status(400).json({ error: 'Invalid request. Action and dareIds array required.' });
    }
    
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const dareId of dareIds) {
      try {
        if (action === 'delete') {
          await Dare.findByIdAndDelete(dareId);
          await logAudit({ action: 'bulk_delete_dare', user: req.userId, target: dareId });
          results.success++;
        } else if (action === 'approve') {
          await Dare.findByIdAndUpdate(dareId, { status: 'approved' });
          await logAudit({ action: 'bulk_approve_dare', user: req.userId, target: dareId });
          results.success++;
        } else if (action === 'reject') {
          await Dare.findByIdAndUpdate(dareId, { status: 'rejected' });
          await logAudit({ action: 'bulk_reject_dare', user: req.userId, target: dareId });
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ dareId, error: 'Invalid action' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ dareId, error: error.message });
      }
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk dare operation.' });
  }
});

// POST /api/bulk/switch-games - bulk switch game operations
router.post('/switch-games', auth, checkPermission('delete_user'), async (req, res) => {
  try {
    const { action, gameIds } = req.body;
    
    if (!action || !gameIds || !Array.isArray(gameIds)) {
      return res.status(400).json({ error: 'Invalid request. Action and gameIds array required.' });
    }
    
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const gameId of gameIds) {
      try {
        if (action === 'delete') {
          await SwitchGame.findByIdAndDelete(gameId);
          await logAudit({ action: 'bulk_delete_switch_game', user: req.userId, target: gameId });
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ gameId, error: 'Invalid action' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ gameId, error: error.message });
      }
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk switch game operation.' });
  }
});

// POST /api/bulk/reports - bulk report operations
router.post('/reports', auth, checkPermission('resolve_report'), async (req, res) => {
  try {
    const { action, reportIds } = req.body;
    
    if (!action || !reportIds || !Array.isArray(reportIds)) {
      return res.status(400).json({ error: 'Invalid request. Action and reportIds array required.' });
    }
    
    const results = { success: 0, failed: 0, errors: [] };
    
    for (const reportId of reportIds) {
      try {
        if (action === 'resolve') {
          await Report.findByIdAndUpdate(reportId, { 
            status: 'resolved',
            resolvedBy: req.userId,
            resolvedAt: new Date()
          });
          await logAudit({ action: 'bulk_resolve_report', user: req.userId, target: reportId });
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ reportId, error: 'Invalid action' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ reportId, error: error.message });
      }
    }
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk report operation.' });
  }
});

module.exports = router; 