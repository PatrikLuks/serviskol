const { mongoose, registerModel } = require('../db');

const PredictionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['churn', 'followup', 'segment'], required: true },
  value: { type: mongoose.Schema.Types.Mixed }, // např. pravděpodobnost, doporučený text, segment
  createdAt: { type: Date, default: Date.now }
});

module.exports = registerModel('Prediction', PredictionSchema);
