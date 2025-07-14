const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Dare = require('../models/Dare');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Report = require('../models/Report');
const { logActivity } = require('../utils/activity');
const { checkPermission } = require('../utils/permissions');
const { sendNotification } = require('../utils/notification');

router.use((req, res) => res.status(410).json({ error: 'Comments are disabled.' }));

// GET /api/comments?dare=dareId - list comments, optionally filter by dare
router.get('/', auth, async (req, res) => {
  try {
    const { dare } = req.query;
    const filter = {};
    if (dare) filter.dare = dare;
    const comments = await Comment.find(filter)
      .populate('author', 'username avatar')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    // Fetch blocked users for filtering
    const currentUser = await User.findById(req.userId).select('blockedUsers');
    const filteredComments = currentUser && currentUser.blockedUsers && currentUser.blockedUsers.length > 0
      ? comments.filter(c => c.author && c.author._id && !currentUser.blockedUsers.map(bu => bu.toString()).includes(c.author._id.toString()))
      : comments;
    res.json(filteredComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list comments.' });
  }
});

// POST /api/comments - add comment (auth required, supports replies)
router.post('/', auth, async (req, res) => {
  try {
    const { dareId, text, parent } = req.body;
    if (!dareId || !text) return res.status(400).json({ error: 'dare and text are required.' });
    const comment = new Comment({
      dare: dareId,
      author: req.userId,
      text,
    });
    await comment.save();
    await logActivity({ type: 'comment_added', user: req.userId, dare: dareId, comment: comment._id });
    // If this is a reply, add to parent comment's replies and notify parent author
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
        if (parentComment.author) {
          await sendNotification(parentComment.author, 'comment_reply', 'You have a new reply to your comment.');
        }
      }
    } else {
      // If top-level, add to dare's comments
      const dareDoc = await Dare.findById(dareId);
      if (dareDoc) {
        dareDoc.comments.push(comment._id);
        await dareDoc.save();
      }
    }
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// POST /comments/:id/report
router.post('/:id/report', async (req, res) => {
  try {
    const commentId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.user?.id; // Assume auth middleware sets req.user
    if (!reason) return res.status(400).json({ error: 'Reason required.' });
    if (!reporterId) return res.status(401).json({ error: 'Authentication required.' });
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    const report = new Report({
      type: 'comment',
      targetId: comment._id,
      reporter: reporterId,
      reason,
    });
    await report.save();
    res.json({ message: 'Report submitted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit report.' });
  }
});

// PATCH /comments/:id - edit comment (author or admin)
router.patch('/:id', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    // Only author or admin can edit
    if (comment.author.toString() !== req.userId && !(req.user && req.user.roles && req.user.roles.includes('admin')))
      return res.status(403).json({ error: 'Unauthorized.' });
    comment.text = text;
    comment.editedAt = new Date();
    await comment.save();
    res.json({ message: 'Comment edited.', comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit comment.' });
  }
});

// DELETE /comments/:id - soft delete (author or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    // Only author or admin can delete
    if (comment.author.toString() !== req.userId && !(req.user && req.user.roles && req.user.roles.includes('admin')))
      return res.status(403).json({ error: 'Unauthorized.' });
    comment.deleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = req.userId;
    await comment.save();
    res.json({ message: 'Comment deleted (soft).', comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// PATCH /comments/:id/moderate - admin/moderator hides/moderates comment
router.patch('/:id/moderate', auth, checkPermission('resolve_report'), async (req, res) => {
  try {
    const { reason } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found.' });
    comment.hidden = true;
    comment.moderatedBy = req.userId;
    comment.moderationReason = reason || '';
    await comment.save();
    // Notify author
    if (comment.author) {
      await sendNotification(comment.author, 'comment_moderated', 'Your comment has been moderated/hidden.');
    }
    res.json({ message: 'Comment moderated/hidden.', comment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to moderate comment.' });
  }
});

module.exports = router; 