const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  incidentId: { type: String, required: true },
  analyst: { type: String, default: 'admin@cyberai.com' },
  submittedBy: { type: String }, // alias for backward compatibility
  feedback: { type: String, required: true }, // 'CONFIRMED_THREAT' | 'FALSE_POSITIVE'
  feedbackType: { type: String }, // alias for backward compatibility
  correctClassification: { type: String, default: null },
  threatType: { type: String },
  analystNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

FeedbackSchema.pre('save', function(next) {
  if (!this.analyst && this.submittedBy) this.analyst = this.submittedBy;
  if (!this.submittedBy && this.analyst) this.submittedBy = this.analyst;
  if (!this.feedback && this.feedbackType) this.feedback = this.feedbackType;
  if (!this.feedbackType && this.feedback) this.feedbackType = this.feedback;
  next();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
