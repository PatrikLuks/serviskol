const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { LeaderboardEntry } = require('../models/Gamification');
const { captureEvent } = require('../utils/posthog');

// POST /api/intake - příjmový dotazník s AI doporučením
router.post('/', auth, async (req, res) => {
  try {
    const { bikeId, symptoms, usage, notes } = req.body;
    if (!bikeId || !symptoms || !usage) {
      return res.status(400).json({ msg: 'Vyplňte všechna povinná pole.' });
    }
    // Zde by bylo volání AI (OpenAI API nebo jiný model)
    // Pro MVP placeholder odpověď:
    const aiRecommendation = `Doporučený servis: ${symptoms.includes('brzdy') ? 'Kontrola brzd' : 'Základní servis'} na základě zadaných příznaků.`;
    // Přidělit body za servisní požadavek
    await LeaderboardEntry.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { points: 10 }, $set: { lastUpdate: new Date() } },
      { upsert: true, new: true }
    );
    captureEvent(req.user._id?.toString() || req.user.id, 'gamification_points_awarded', { points: 10, bikeId, symptoms });
    captureEvent(req.user._id?.toString() || req.user.id, 'intake_submitted', { bikeId, symptoms, usage });
    res.json({ recommendation: aiRecommendation });
  } catch (err) {
    captureEvent(req.user._id?.toString() || req.user.id, 'intake_error', { error: err.message });
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
