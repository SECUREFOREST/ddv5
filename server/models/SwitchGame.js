const mongoose = require('mongoose');

const SwitchGameSchema = new mongoose.Schema({
  status: { type: String, enum: ['open', 'waiting_for_participant', 'in_progress', 'completed', 'proof_submitted', 'awaiting_proof', 'expired', 'forfeited'], default: 'open' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorDare: {
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    move: { type: String, enum: ['rock', 'paper', 'scissors'], required: true }
  },
  participantDare: {
    description: { type: String },
    difficulty: { type: String },
    move: { type: String, enum: ['rock', 'paper', 'scissors'] },
    consent: { type: Boolean }
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Explicit loser field
  // Draw scenario fields
  bothLose: { type: Boolean, default: false }, // Both players lose (rock vs rock)
  bothWin: { type: Boolean, default: false }, // Both players win (paper vs paper)
  drawType: { type: String, enum: ['rock', 'paper', 'scissors', null], default: null }, // Type of draw
  proof: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // userId of loser
    text: String, // proof text or link
    review: {
      action: { type: String, enum: ['approved', 'rejected'] },
      feedback: String
    }
  },
  proofExpiresAt: { type: Date }, // 48h after proof submission or view
  expireProofAfterView: { type: Boolean, default: false },
  proofViewedAt: { type: Date },
  assignedDareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dare' },
  grades: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      grade: { type: Number, min: 1, max: 10 },
      feedback: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  public: { type: Boolean, default: true },
  // OSA-style content expiration
  contentDeletion: { type: String, enum: ['delete_after_view', 'delete_after_30_days', 'never_delete'], default: 'delete_after_30_days' },
  contentExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('SwitchGame', SwitchGameSchema); 