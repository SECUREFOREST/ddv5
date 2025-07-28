const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dare',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  editedAt: {
    type: Date,
    default: null
  },
  moderated: {
    type: Boolean,
    default: false
  },
  moderationReason: {
    type: String,
    maxlength: 500
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
commentSchema.index({ dare: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model('Comment', commentSchema); 