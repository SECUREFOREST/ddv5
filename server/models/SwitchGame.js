const mongoose = require('mongoose');

const SwitchGameSchema = new mongoose.Schema({
  status: { type: String, enum: ['waiting_for_participant', 'in_progress', 'completed', 'proof_submitted', 'awaiting_proof', 'chickened_out'], default: 'waiting_for_participant' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creatorDare: {
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    move: { type: String, enum: ['rock', 'paper', 'scissors'] }, // Remove required: true
    tags: [{ type: String }]
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
    files: [{
      filename: String, // stored filename
      originalName: String, // original filename
      mimetype: String, // file type
      size: Number, // file size in bytes
      path: String // file path on server
    }],
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
      grade: { type: Number, min: 1, max: 5 },
      feedback: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  public: { type: Boolean, default: true },
  // OSA-style content expiration
  contentDeletion: { type: String, enum: ['delete_after_view', 'delete_after_30_days', 'never_delete'], default: 'delete_after_30_days' },
  contentExpiresAt: { type: Date },
  // Likes array to track user likes
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // Optional public claim token for tokenized claim flows (similar to Dare.claimToken)
  claimToken: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Pre-save hook to ensure data consistency
SwitchGameSchema.pre('save', function(next) {
  // Ensure moves are strings if they exist
  if (this.creatorDare && this.creatorDare.move) {
    this.creatorDare.move = this.creatorDare.move.toString();
  }
  if (this.participantDare && this.participantDare.move) {
    this.participantDare.move = this.participantDare.move.toString();
  }
  
  // Ensure winner and loser are ObjectIds if they exist
  if (this.winner && typeof this.winner === 'string') {
    this.winner = new mongoose.Types.ObjectId(this.winner);
  }
  if (this.loser && typeof this.loser === 'string') {
    this.loser = new mongoose.Types.ObjectId(this.loser);
  }
  
  next();
});

module.exports = mongoose.model('SwitchGame', SwitchGameSchema); 