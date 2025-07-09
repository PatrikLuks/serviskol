// Model pro gamifikaci: odměny, úrovně, žebříčky
const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  points: { type: Number, required: true },
  icon: String,
  active: { type: Boolean, default: true }
});

const leaderboardEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, default: 0 },
  level: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  lastUpdate: { type: Date, default: Date.now }
});

module.exports = {
  Reward: mongoose.model('Reward', rewardSchema),
  LeaderboardEntry: mongoose.model('LeaderboardEntry', leaderboardEntrySchema)
};
