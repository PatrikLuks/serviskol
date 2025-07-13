const mongoose = require('mongoose');

const ReportSettingSchema = new mongoose.Schema({
  emails: [String], // příjemci
  frequency: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
  enabled: { type: Boolean, default: true },
  enabledSections: {
    type: [String],
    default: ['aiSummary','ctrTrend','heatmap'] // výchozí sekce
  },
  // Nové pole pro časový rozsah reportu
  dateFrom: { type: Date },
  dateTo: { type: Date },
  // Plánované rozesílání
  scheduledSend: { type: Boolean, default: false },
  lastSentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ReportSettingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ReportSetting', ReportSettingSchema);
