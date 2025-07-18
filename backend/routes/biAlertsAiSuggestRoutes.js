const express = require('express');
const { getModel } = require('../db');
const FollowupAutomation = getModel('FollowupAutomation');
const { Configuration, OpenAIApi } = require('openai');
const router = express.Router();

// POST /api/bi/alerts/suggest-variant
router.post('/suggest-variant', async (req, res) => {
  const { automationId, worstVariant } = req.body;
  if (!automationId || !worstVariant) return res.status(400).json({ error: 'Chybí parametry.' });
  try {
    const automation = await FollowupAutomation.findById(automationId);
    if (!automation) return res.status(404).json({ error: 'Automatizace nenalezena.' });
    const prompt = `Navrhni novou variantu follow-up zprávy pro segment "${automation.triggerSegment}". Stávající neúspěšná varianta: \n"${automation.variants.find(v => v.name === worstVariant)?.messageTemplate || ''}". Cíl: zvýšit retenci a engagement. Návrh:`;
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const aiRes = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Jsi expert na retention marketing a copywriting.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200
    });
    const suggestion = aiRes.data.choices[0].message.content.trim();
    res.json({ suggestion });
  } catch (e) {
    res.status(500).json({ error: 'Chyba AI generování: ' + e.message });
  }
});

module.exports = router;
