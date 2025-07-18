const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const Notification = require('../models/Notification');
const { getModel } = require('../db');
const User = getModel('User');

// POST /api/bi/followup-predict-best-variant
router.post('/followup-predict-best-variant', async (req, res) => {
  const { segment, variants } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.status(400).json({ error: 'OpenAI API key není nastaven.' });
  if (!Array.isArray(variants) || variants.length < 2) return res.status(400).json({ error: 'Musí být zadány alespoň dvě varianty.' });
  // Sestav prompt z historických dat
  const notifs = await Notification.find({ type: 'followup', variant: { $in: variants.map(v => v.label) } }).lean();
  const stats = {};
  for (const v of variants) stats[v.label] = { total: 0, retained: 0 };
  for (const n of notifs) {
    stats[n.variant] && stats[n.variant].total++;
    if (n.variant) {
      const u = await User.findById(n.user).lean();
      if (u && u.aiSegment === segment) stats[n.variant].retained++;
    }
  }
  let prompt = `Mám následující varianty follow-up zpráv pro segment "${segment}":\n`;
  for (const v of variants) {
    prompt += `Varianta ${v.label}: ${v.messageTemplate}\n`;
    prompt += `Historická retence: ${stats[v.label].retained}/${stats[v.label].total}\n`;
  }
  prompt += 'Která varianta bude nejúspěšnější pro nové uživatele tohoto segmentu? Odpověz pouze názvem varianty.';
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 20
    });
    const best = completion.data.choices[0].message.content.trim();
    res.json({ best });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při AI predikci' });
  }
});

module.exports = router;
