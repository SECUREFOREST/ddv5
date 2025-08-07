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
  dareCooldownUntil: { type: Date },
  openDares: { type: Number, default: 0 },
  consentedDares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dare' }],
  completedDares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dare' }],
  createdAt: { type: Date, default: Date.now },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  refreshTokens: [{ type: String }],
  settings: {
    dashboard_tab: { type: String, default: null }
  },
  contentDeletion: {
    type: String,
    enum: [
      'delete_after_view', 'delete_after_30_days', 'never_delete', '',
      'when_viewed', '30_days', 'never'
    ],
    default: '',
    set: function(value) {
      const validValues = ['delete_after_view', 'delete_after_30_days', 'never_delete', '', 'when_viewed', '30_days', 'never'];
      
      // If the value is invalid, log a warning and return the default
      if (value && !validValues.includes(value)) {
        console.warn(`Invalid contentDeletion value "${value}" being set, using default empty string`);
        return '';
      }
      
      return value;
    }
  },
});

// Pre-save hook to fix invalid contentDeletion values
UserSchema.pre('save', function(next) {
  const validValues = ['delete_after_view', 'delete_after_30_days', 'never_delete', '', 'when_viewed', '30_days', 'never'];
  
  if (this.contentDeletion && !validValues.includes(this.contentDeletion)) {
    console.warn(`Invalid contentDeletion value "${this.contentDeletion}" for user ${this.username}, setting to default`);
    this.contentDeletion = '';
  }
  
  next();
});

module.exports = mongoose.model('User', UserSchema); 