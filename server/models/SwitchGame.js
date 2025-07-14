const mongoose = require('mongoose');

const SwitchGameSchema = new mongoose.Schema({
  status: { type: String, enum: ['open', 'in_progress', 'completed', 'proof_submitted', 'awaiting_proof', 'expired', 'forfeited'], default: 'open' },
  creator: { type: String, required: true }, // username
  participant: { type: String }, // username
  creatorDare: {
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    move: { type: String, enum: ['rock', 'paper', 'scissors'], required: true }
  },
  participantDare: {
    difficulty: { type: String },
    move: { type: String, enum: ['rock', 'paper', 'scissors'] },
    consent: { type: Boolean }
  },
  winner: { type: String }, // username
  proof: {
    user: String, // username of loser
    text: String, // proof text or link
  },
  proofExpiresAt: { type: Date }, // 48h after proof submission or view
  expireProofAfterView: { type: Boolean, default: false },
  proofViewedAt: { type: Date },
  assignedDareId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dare' },
}, { timestamps: true });

module.exports = mongoose.model('SwitchGame', SwitchGameSchema); 