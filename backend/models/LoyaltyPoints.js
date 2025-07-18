// LoyaltyPoints model pro MongoDB (Mongoose)
const { mongoose, registerModel } = require('../db');

const loyaltyPointsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, default: 0 },
  history: [
    {
      date: Date,
      amount: Number,
      reason: String
    }
  ],
  badges: [{ type: String }], // např. ['První servis', '100 bodů']
  level: { type: Number, default: 1 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' }
});

module.exports = registerModel('LoyaltyPoints', loyaltyPointsSchema);
