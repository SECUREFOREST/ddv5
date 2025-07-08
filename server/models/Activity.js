const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'act_created', 'comment_added', 'act_completed', 'grade_given'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  act: { type: mongoose.Schema.Types.ObjectId, ref: 'Act' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema); 