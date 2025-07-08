const mongoose = require('mongoose');

const AppealSchema = new mongoose.Schema({
  type: { type: String, enum: ['unblock', 'refund', 'act'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId }, // e.g., actId or userId
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  outcome: { type: String },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Appeal', AppealSchema); 