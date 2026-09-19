const mongoose = require('mongoose');

const ThreatSchema = new mongoose.Schema({
  threatId: { type: String },
  threatType: { type: String, required: true },
  name: { type: String }, // alias for backward compatibility
  confidence: { type: Number, default: 0.85 },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  sourceIP: { type: String, required: true },
  sourceIp: { type: String }, // alias
  affectedSystem: { type: String, default: '10.0.0.1' },
  evidence: { type: mongoose.Schema.Types.Mixed, default: [] },
  detectedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' },
  description: { type: String },
  indicatorsOfCompromise: [String],
  mitigationSteps: [String],
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ThreatSchema.pre('save', function(next) {
  if (!this.threatId) {
    this.threatId = `THR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (!this.name && this.threatType) this.name = this.threatType;
  if (!this.threatType && this.name) this.threatType = this.name;
  if (!this.sourceIp && this.sourceIP) this.sourceIp = this.sourceIP;
  if (!this.sourceIP && this.sourceIp) this.sourceIP = this.sourceIp;
  next();
});

module.exports = mongoose.model('Threat', ThreatSchema);
