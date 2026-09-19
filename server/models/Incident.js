const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true },
  title: { type: String },
  description: { type: String },
  threatType: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['New', 'Investigating', 'Contained', 'Resolved', 'False Positive'], default: 'New' },
  affectedAssets: { type: [String], default: [] },
  evidence: { type: Array, default: [] },
  attackTimeline: { type: Array, default: [] },
  timeline: { type: Array, default: [] }, // alias for backward compatibility
  aiExplanation: { type: String, default: '' },
  recommendedResponse: { type: mongoose.Schema.Types.Mixed, default: [] },
  recommendedActions: { type: Array, default: [] }, // alias for backward compatibility
  
  // Operational details
  sourceIp: { type: String, default: '192.168.1.100' },
  destinationIp: { type: String, default: '10.0.0.1' },
  username: { type: String, default: 'admin' },
  riskFactors: { type: Array, default: [] },
  responseHistory: { type: Array, default: [] },
  analystNotes: { type: String, default: '' },
  feedbackType: { type: String, default: null }, // 'CONFIRMED_THREAT' | 'FALSE_POSITIVE'
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

IncidentSchema.pre('save', function(next) {
  if (!this.title) {
    this.title = `${this.threatType} Incident on ${this.destinationIp || 'Internal Asset'}`;
  }
  if (!this.description) {
    this.description = this.aiExplanation || `Automated alert detected for ${this.threatType}.`;
  }
  if ((!this.affectedAssets || this.affectedAssets.length === 0) && (this.destinationIp || this.username)) {
    this.affectedAssets = [this.destinationIp, this.username].filter(Boolean);
  }
  if ((!this.attackTimeline || this.attackTimeline.length === 0) && this.timeline && this.timeline.length > 0) {
    this.attackTimeline = this.timeline;
  }
  if ((!this.timeline || this.timeline.length === 0) && this.attackTimeline && this.attackTimeline.length > 0) {
    this.timeline = this.attackTimeline;
  }
  if ((!this.recommendedResponse || this.recommendedResponse.length === 0) && this.recommendedActions && this.recommendedActions.length > 0) {
    this.recommendedResponse = this.recommendedActions;
  }
  if ((!this.recommendedActions || this.recommendedActions.length === 0) && this.recommendedResponse && this.recommendedResponse.length > 0) {
    this.recommendedActions = Array.isArray(this.recommendedResponse) ? this.recommendedResponse : [{ label: this.recommendedResponse }];
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Incident', IncidentSchema);
