const mongoose = require('mongoose');

// Activity schema for logging user actions (dares, comments, grades, etc.)
const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'dare', 'comment', 'grade', etc.
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dare: { type: mongoose.Schema.Types.ObjectId, ref: 'Dare' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema); 