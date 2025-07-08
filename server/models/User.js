const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  bio: { type: String },
  roles: [{ type: String }],
  stats: { type: mongoose.Schema.Types.Mixed },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banned: { type: Boolean, default: false },
  actCooldownUntil: { type: Date },
  openActs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshTokens: [{ type: String }],
});

module.exports = mongoose.model('User', UserSchema); 