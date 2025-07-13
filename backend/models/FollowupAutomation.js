const mongoose = require('mongoose');

const FollowupAutomationSchema = new mongoose.Schema({
  triggerSegment: { type: String, required: true }, // např. 'riziko_odchodu'
  channel: { type: String, enum: ['in-app', 'email', 'push'], default: 'in-app' },
  // Podpora více variant pro A/B testování
  variants: [{
    label: { type: String },
    messageTemplate: { type: String, required: true },
    active: { type: Boolean, default: true }
  }],
  // Pro zpětnou kompatibilitu
  messageTemplate: { type: String },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowupAutomation', FollowupAutomationSchema);
