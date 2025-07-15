// Vygeneruje AI follow-up zprávu pro segment a kanál (bez nutnosti existujícího alertu)
const express = require('express');
const router = express.Router();
const { generateFollowupMessage } = require('../utils/openai');
const { captureEvent } = require('../utils/posthog');

router.post('/ai/generate-segment-followup-message', async (req, res) => {
  const { segment, ctr, days } = req.body;
  const userId = req.user?._id?.toString() || req.user?.id || 'anonymous';
  if (!segment) return res.status(400).json({ error: 'Chybí segment.' });
  try {
    const message = await generateFollowupMessage({ segment, ctr: ctr ?? 0.1, days: days ?? 14 });
    captureEvent(userId, 'ai_generate_followup', { segment, ctr, days });
    res.json({ message });
  } catch (e) {
    captureEvent(userId, 'ai_generate_followup_error', { segment, ctr, days, error: e.message });
    res.status(500).json({ error: 'Chyba při generování follow-up zprávy.' });
  }
});

module.exports = router;
