const { mongoose, registerModel } = require('../db');

const SecurityAlertSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. 'role-change', 'suspicious-login', 'failed-login', 'privilege-escalation'
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = registerModel('SecurityAlert', SecurityAlertSchema);
