const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  act: { type: mongoose.Schema.Types.ObjectId, ref: 'Act', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema); 