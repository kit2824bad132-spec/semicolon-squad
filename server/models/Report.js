const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true },
  incidentId: { type: String, required: true },
  title: { type: String },
  summary: { type: String },
  attackSequence: { type: Array, default: [] },
  impact: { type: String },
  potentialImpact: { type: String }, // alias
  evidence: { type: Array, default: [] },
  response: { type: mongoose.Schema.Types.Mixed, default: [] },
  responseActions: { type: Array, default: [] }, // alias
  generatedAt: { type: Date, default: Date.now },
  date: { type: Date, default: Date.now },
  threatType: { type: String },
  severity: { type: String },
  riskScore: { type: Number },
  affectedAssets: [String],
  sourceIp: { type: String },
  aiAnalysis: { type: String },
  resolution: { type: String },
  analystFeedback: { type: String }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ReportSchema.pre('save', function(next) {
  if (!this.reportId) {
    this.reportId = `RPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (!this.summary && this.aiAnalysis) this.summary = this.aiAnalysis;
  if (!this.impact && this.potentialImpact) this.impact = this.potentialImpact;
  if (!this.response && this.responseActions) this.response = this.responseActions;
  if (!this.responseActions && this.response) {
    this.responseActions = Array.isArray(this.response) ? this.response : [{ action: this.response }];
  }
  next();
});

module.exports = mongoose.model('Report', ReportSchema);
