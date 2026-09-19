const mongoose = require('mongoose');

const SecurityEventSchema = new mongoose.Schema({
  eventId: { type: String, unique: true },
  timestamp: { type: Date, default: Date.now },
  sourceIP: { type: String, required: true },
  sourceIp: { type: String }, // alias for backward compatibility
  destinationIP: { type: String, default: '10.0.0.1' },
  destinationIp: { type: String }, // alias for backward compatibility
  username: { type: String, default: 'anonymous' },
  eventType: { type: String, default: 'Network Traffic' },
  protocol: { type: String, default: 'HTTP' },
  port: { type: Number, default: 80 },
  sourcePort: { type: Number },
  destinationPort: { type: Number },
  failedLogins: { type: Number, default: 0 },
  loginSuccess: { type: Number, default: 1 },
  dataTransferred: { type: Number, default: 0 },
  bytesSent: { type: Number, default: 0 },
  bytesReceived: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  requestCount: { type: Number, default: 1 },
  privilegeLevel: { type: String, default: 'User' },
  unusualActivity: { type: Boolean, default: false },
  isAnomaly: { type: Boolean, default: false },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'LOW' },
  anomalyScore: { type: Number, default: 0.0 },
  threatType: { type: String, default: 'Unusual Network Activity' },
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Sync aliases before saving
SecurityEventSchema.pre('save', function(next) {
  if (!this.sourceIp && this.sourceIP) this.sourceIp = this.sourceIP;
  if (!this.sourceIP && this.sourceIp) this.sourceIP = this.sourceIp;
  if (!this.destinationIp && this.destinationIP) this.destinationIp = this.destinationIP;
  if (!this.destinationIP && this.destinationIp) this.destinationIP = this.destinationIp;
  if (this.isAnomaly && !this.unusualActivity) this.unusualActivity = true;
  if (!this.dataTransferred && (this.bytesSent || this.bytesReceived)) {
    this.dataTransferred = (this.bytesSent || 0) + (this.bytesReceived || 0);
  }
  if (!this.eventId) {
    this.eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

module.exports = mongoose.model('SecurityEvent', SecurityEventSchema);
