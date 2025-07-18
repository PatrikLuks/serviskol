const { mongoose, registerModel } = require('../db');

const SegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  filters: { type: Object }, // JSON popis segmentace
  createdAt: { type: Date, default: Date.now }
});

module.exports = registerModel('Segment', SegmentSchema);
