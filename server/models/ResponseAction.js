const mongoose = require('mongoose');

const ResponseActionSchema = new mongoose.Schema({
  actionId: { type: String },
  incidentId: { type: String, required: true },
  action: { type: String, required: true }, // e.g. 'Simulated IP Block'
  actionType: { type: String }, // alias for backward compatibility
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'HIGH' },
  status: { type: String, default: 'SIMULATED_SUCCESS' },
  simulationMode: { type: Boolean, default: true },
  mode: { type: String, default: 'SIMULATION MODE' },
  executedAt: { type: Date, default: Date.now },
  description: { type: String },
  details: { type: String }, // alias
  target: { type: String, default: 'Unknown' },
  executedBy: { type: String, default: 'Autonomous AI Engine' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ResponseActionSchema.pre('save', function(next) {
  if (!this.actionId) {
    this.actionId = `ACT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  if (!this.action && this.actionType) this.action = this.actionType;
  if (!this.actionType && this.action) this.actionType = this.action;
  if (!this.description && this.details) this.description = this.details;
  if (!this.details && this.description) this.details = this.description;
  this.simulationMode = true; // Strict simulation mode guarantee
  this.mode = 'SIMULATION MODE';
  next();
});

module.exports = mongoose.model('ResponseAction', ResponseActionSchema);
