const mongoose = require('mongoose');

const DareSchema = new mongoose.Schema({
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed', 'in_progress', 'graded'], default: 'pending' },
  difficulty: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  grades: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grade: { type: Number },
    feedback: { type: String },
  }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  proof: {
    text: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
  },
  proofExpiresAt: { type: Date },
  rejection: {
    reason: { type: String },
    rejectedAt: { type: Date },
    cooldownUntil: { type: Date },
  },
  public: { type: Boolean, default: false },
  actType: { type: String, enum: ['submission', 'domination', 'switch'], default: 'submission' },
  allowedRoles: [{ type: String }],
  performer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedSwitch: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Dare', DareSchema); 