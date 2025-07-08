const mongoose = require('mongoose');

const SwitchGameSchema = new mongoose.Schema({
  name: { type: String },
  status: { type: String, enum: ['open', 'completed'], default: 'open' },
  participants: [{ type: String }], // store usernames for simplicity
  moves: { type: Map, of: String }, // { username: 'rock' | 'paper' | 'scissors' }
  winner: { type: String }, // username
  proof: {
    user: String, // username of loser
    text: String, // proof text or link
  },
  proofExpiresAt: { type: Date }, // 48h after proof submission
}, { timestamps: true });

module.exports = mongoose.model('SwitchGame', SwitchGameSchema); 