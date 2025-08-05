const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['harassment', 'non_consensual', 'underage', 'hate_speech', 'impersonation', 'spam', 'technical', 'other'],
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  reportedUser: {
    type: String,
    trim: true,
    maxlength: 50
  },
  evidence: {
    type: String,
    maxlength: 1000
  },
  contactEmail: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  allowContact: {
    type: Boolean,
    default: true
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
ReportSchema.index({ type: 1, urgency: 1, status: 1, timestamp: -1 });
ReportSchema.index({ reporterId: 1, timestamp: -1 });
ReportSchema.index({ reportedUser: 1, timestamp: -1 });

// Virtual for time since report
ReportSchema.virtual('timeSinceReport').get(function() {
  return Date.now() - this.timestamp;
});

// Method to mark as reviewed
ReportSchema.methods.markAsReviewed = function(adminId, notes) {
  this.status = 'reviewed';
  this.adminId = adminId;
  this.adminNotes = notes;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to resolve report
ReportSchema.methods.resolve = function(adminId, notes) {
  this.status = 'resolved';
  this.adminId = adminId;
  this.adminNotes = notes;
  this.reviewedAt = new Date();
  return this.save();
};

// Method to dismiss report
ReportSchema.methods.dismiss = function(adminId, notes) {
  this.status = 'dismissed';
  this.adminId = adminId;
  this.adminNotes = notes;
  this.reviewedAt = new Date();
  return this.save();
};

// Static method to get reports by urgency
ReportSchema.statics.getByUrgency = function(urgency) {
  return this.find({ urgency }).sort({ timestamp: -1 });
};

// Static method to get pending reports
ReportSchema.statics.getPending = function() {
  return this.find({ status: 'pending' }).sort({ urgency: -1, timestamp: -1 });
};

// Static method to get reports by type
ReportSchema.statics.getByType = function(type) {
  return this.find({ type }).sort({ timestamp: -1 });
};

module.exports = mongoose.model('Report', ReportSchema); 