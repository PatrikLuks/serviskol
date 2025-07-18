const { mongoose, registerModel } = require('../db');

const EngagementMetricSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  channel: { type: String, enum: ['in-app', 'email', 'push', 'sms'], required: true },
  sent: { type: Number, default: 0 },
  opened: { type: Number, default: 0 },
  clicked: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  segment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = registerModel('EngagementMetric', EngagementMetricSchema);
