const mongoose = require('mongoose');

const WebhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  event: { type: String, enum: ['bi_export', 'segment_change', 'ai_segment_change', 'alert'], required: true },
  format: { type: String, enum: ['csv', 'json'], default: 'json' },
  filter: { type: Object }, // např. { segment: 'VIP', from: '2025-01-01' }
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], default: 'daily' },
  lastTriggered: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastStatus: { type: String },
  lastResponse: { type: String },
  errorCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Webhook', WebhookSchema);
