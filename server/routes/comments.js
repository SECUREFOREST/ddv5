const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');
const { sendNotification } = require('../utils/notification');
const { logAudit } = require('../utils/auditLog');

// Import models
const Comment = require('../models/Comment');
const User = require('../models/User');

// GET /api/comments/:dareId - get comments for a dare
router.get('/:dareId', async (req, res) => {
  try {
    const comments = await Comment.find({ dare: req.params.dareId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// POST /api/comments - create a comment
router.post('/', auth, [
  body('dareId').isMongoId().withMessage('Dare ID must be a valid MongoDB ObjectId.'),
  body('text').isString().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const { dareId, text } = req.body;
    
    const comment = new Comment({
      user: req.userId,
      dare: dareId,
      text: text.trim()
    });
    
    await comment.save();
    
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName avatar');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create comment.' });
  }
});

// PATCH /api/comments/:id - edit a comment
router.patch('/:id', auth, [
  body('text').isString().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments.' });
    }
    
    comment.text = req.body.text.trim();
    comment.editedAt = new Date();
    await comment.save();
    
    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'username fullName avatar');
    
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit comment.' });
  }
});

// DELETE /api/comments/:id - delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    
    // Allow user to delete their own comment or admin to delete any comment
    const user = await User.findById(req.userId);
    const isAdmin = user && user.roles && user.roles.includes('admin');
    
    if (comment.user.toString() !== req.userId && !isAdmin) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }
    
    await comment.deleteOne();
    
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// POST /api/comments/:id/report - report a comment
router.post('/:id/report', auth, [
  body('reason').isString().isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    
    // Create report
    const Report = require('../models/Report');
    const report = new Report({
      type: 'comment',
      targetId: comment._id,
      reason: req.body.reason,
      reporter: req.userId
    });
    
    await report.save();
    await logAudit({ action: 'report_comment', user: req.userId, target: comment._id });
    
    res.json({ message: 'Comment reported successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report comment.' });
  }
});

// PATCH /api/comments/:id/moderate - moderate a comment (admin/moderator)
router.patch('/:id/moderate', auth, [
  body('reason').isString().isLength({ min: 5, max: 500 }).withMessage('Reason must be between 5 and 500 characters.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
  }
  
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    
    // Update comment status
    comment.moderated = true;
    comment.moderationReason = req.body.reason;
    comment.moderatedBy = req.userId;
    comment.moderatedAt = new Date();
    await comment.save();
    
    // Notify comment author
    await sendNotification(
      comment.user,
      'comment_moderated',
      `Your comment has been moderated: ${req.body.reason}`,
      req.userId
    );
    
    await logAudit({ action: 'moderate_comment', user: req.userId, target: comment._id });
    
    res.json({ message: 'Comment moderated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate comment.' });
  }
});

module.exports = router; 