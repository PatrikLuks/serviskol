const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { LeaderboardEntry } = require('../models/Gamification');

// POST /api/feedback
router.post('/', async (req, res) => {
  const { message, email } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Zpětná vazba je povinná.' });
  }
  const feedback = {
    message,
    email: email || null,
    date: new Date().toISOString(),
    ip: req.ip
  };
  const logPath = path.join(__dirname, '../logs/feedback.log');
  fs.appendFile(logPath, JSON.stringify(feedback) + '\n', err => {
    if (err) {
      return res.status(500).json({ error: 'Chyba při ukládání zpětné vazby.' });
    }
  });

  try {
    // Přidělit body za feedback
    await LeaderboardEntry.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { points: 5 }, $set: { lastUpdate: new Date() } },
      { upsert: true, new: true }
    );
  } catch (err) {
    return res.status(500).json({ error: 'Chyba při přidělování bodů.' });
  }

  res.json({ success: true });
});

module.exports = router;
