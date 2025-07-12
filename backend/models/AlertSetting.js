const mongoose = require('mongoose');

const alertSettingSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['ctr', 'engagement', 'churn'], required: true },
  channel: { type: String, enum: ['in-app', 'email', 'push', 'sms', 'all'], default: 'all' },
  threshold: { type: Number, required: true }, // procentuální pokles (např. 30)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AlertSetting', alertSettingSchema);
