const mongoose = require('mongoose');

const TimeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  note: { type: String },
  activityType: { type: String, enum: ['development','meeting','testing','review','other'], default: 'development' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeLog', TimeLogSchema);
