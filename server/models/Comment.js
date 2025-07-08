const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  act: { type: mongoose.Schema.Types.ObjectId, ref: 'Act', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
  editedAt: { type: Date },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  flagged: { type: Boolean, default: false },
  hidden: { type: Boolean, default: false },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderationReason: { type: String },
});

module.exports = mongoose.model('Comment', CommentSchema); 