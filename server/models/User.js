const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  interestedIn: [{ type: String }],
  limits: [{ type: String }],
  avatar: { type: String },
  bio: { type: String },
  roles: [{ type: String }],
  stats: { type: mongoose.Schema.Types.Mixed },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  banned: { type: Boolean, default: false },
  actCooldownUntil: { type: Date },
  openActs: { type: Number, default: 0 },
  consentedActs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Act' }],
  completedActs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Act' }],
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshTokens: [{ type: String }],
});

module.exports = mongoose.model('User', UserSchema); 