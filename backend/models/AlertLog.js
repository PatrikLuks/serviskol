const mongoose = require('mongoose');

const alertLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  channel: { type: String },
  threshold: { type: Number },
  value: { type: Number },
  period: { type: String }, // např. 'week', 'month'
  message: { type: String },
  read: { type: Boolean, default: false },
  action: { type: String }, // doporučená akce
  actionType: { type: String }, // 'channel' | 'followup' | 'recommendation'
  segment: { type: Object }, // segmentace (např. { role, region, ageGroup })
  // --- follow-up plánování ---
  followupMessage: { type: String },
  scheduledAt: { type: Date }, // plánované odeslání follow-upu
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }, // reference na follow-up kampaň
  actionResult: { type: String },
  actionAffected: { type: Number },
  actionExecutedAt: { type: Date },
  // --- automatizované workflow ---
  proposedAction: { type: Object }, // návrh akce (např. { type, message, variants, channel, aiSuggestion })
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'auto'], default: 'pending' },
  approvalBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalAt: { type: Date },
  audit: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  aiFeedback: { type: String, enum: ['excellent', 'good', 'neutral', 'bad', 'irrelevant'], default: 'neutral' }
});

module.exports = mongoose.model('AlertLog', alertLogSchema);
