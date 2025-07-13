const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  filters: { type: Object }, // JSON popis segmentace
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Segment', SegmentSchema);
