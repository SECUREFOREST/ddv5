const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Act = require('../models/Act');
const auth = require('../middleware/auth');

// GET /api/comments?act=actId - list comments, optionally filter by act
router.get('/', async (req, res) => {
  try {
    const { act } = req.query;
    const filter = {};
    if (act) filter.act = act;
    const comments = await Comment.find(filter)
      .populate('author', 'username avatar')
      .populate({ path: 'replies', populate: { path: 'author', select: 'username avatar' } })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list comments.' });
  }
});

// POST /api/comments - add comment (auth required, supports replies)
router.post('/', auth, async (req, res) => {
  try {
    const { act, text, parent } = req.body;
    if (!act || !text) return res.status(400).json({ error: 'act and text are required.' });
    const comment = new Comment({
      act,
      author: req.userId,
      text,
    });
    await comment.save();
    // If this is a reply, add to parent comment's replies
    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    } else {
      // If top-level, add to act's comments
      const actDoc = await Act.findById(act);
      if (actDoc) {
        actDoc.comments.push(comment._id);
        await actDoc.save();
      }
    }
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

module.exports = router; 