const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  reply: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  rating: { type: Number, enum: [-1, 0, 1], default: 0 },
  feedback: { type: String }
});

module.exports = mongoose.model('AIMessage', aiMessageSchema);
