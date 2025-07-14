const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'dare_created', 'comment_added', 'dare_completed', 'grade_given'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dare: { type: mongoose.Schema.Types.ObjectId, ref: 'Dare' },
  details: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', ActivitySchema); 