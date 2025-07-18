// Message model pro MongoDB (Mongoose)
const { mongoose, registerModel } = require('../db');

const messageSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  attachments: [String]
});

module.exports = registerModel('Message', messageSchema);
