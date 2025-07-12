// Vygeneruje AI follow-up zprávu pro segment a kanál (bez nutnosti existujícího alertu)
const express = require('express');
const router = express.Router();
const { generateFollowupMessage } = require('../utils/openai');

router.post('/ai/generate-segment-followup-message', async (req, res) => {
  const { segment, ctr, days } = req.body;
  if (!segment) return res.status(400).json({ error: 'Chybí segment.' });
  try {
    const message = await generateFollowupMessage({ segment, ctr: ctr ?? 0.1, days: days ?? 14 });
    res.json({ message });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování follow-up zprávy.' });
  }
});

module.exports = router;
