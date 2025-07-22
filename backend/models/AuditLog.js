const { mongoose, registerModel } = require('../db');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

module.exports = registerModel('AuditLog', AuditLogSchema);
module.exports.AuditLogSchema = AuditLogSchema;
