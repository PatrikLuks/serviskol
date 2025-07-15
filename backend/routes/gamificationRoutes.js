const express = require('express');
const router = express.Router();
const { Reward, LeaderboardEntry } = require('../models/Gamification');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/gamification/rewards - seznam odměn
router.get('/rewards', auth, async (req, res) => {
  const rewards = await Reward.find({ active: true });
  res.json(rewards);
});

// POST /api/gamification/claim - uživatel si nárokuje odměnu
router.post('/claim', auth, async (req, res) => {
  const { rewardId } = req.body;
  const reward = await Reward.findById(rewardId);
  if (!reward || !reward.active) return res.status(400).json({ msg: 'Odměna není dostupná.' });
  // Přidat body uživateli
  const entry = await LeaderboardEntry.findOneAndUpdate(
    { user: req.user.id },
    { $inc: { points: reward.points }, $set: { lastUpdate: new Date() } },
    { upsert: true, new: true }
  );
  res.json({ msg: 'Odměna přidělena.', entry });
});

// GET /api/gamification/leaderboard - žebříček
router.get('/leaderboard', auth, async (req, res) => {
  const top = await LeaderboardEntry.find().populate('user', 'name').sort({ points: -1 }).limit(20);
  res.json(top);
});

module.exports = router;
