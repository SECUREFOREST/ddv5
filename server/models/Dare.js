const mongoose = require('mongoose');

const DareSchema = new mongoose.Schema({
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'completed', 'in_progress', 'graded', 'waiting_for_participant', 'forfeited'], default: 'waiting_for_participant' },
  difficulty: { type: String },
  grades: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The person being graded
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
  public: { type: Boolean, default: true },
  dareType: { type: String, enum: ['submission', 'domination', 'switch'], default: 'submission' },
  allowedRoles: [{ type: String }],
  performer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedSwitch: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimable: { type: Boolean, default: false },
  claimToken: { type: String, unique: true, sparse: true },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: { type: Date },
  claimDemand: { type: String },
  requiresConsent: { type: Boolean, default: false }, // For double-consent dom demands
  // Consent tracking for dom demands
  consented: { type: Boolean, default: false },
  consentedAt: { type: Date },
});

module.exports = mongoose.model('Dare', DareSchema); 