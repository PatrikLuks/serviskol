const { mongoose, registerModel } = require('../db');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  type: { type: String, enum: ['service', 'loyalty', 'chat', 'system', 'bi_alert'], required: false },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  channel: { type: String, enum: ['in-app', 'email', 'push', 'sms'], default: 'in-app' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = registerModel('Notification', notificationSchema);
