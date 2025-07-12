const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['service', 'loyalty', 'chat', 'system'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  channel: { type: String, enum: ['in-app', 'email', 'push', 'sms'], default: 'in-app' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
