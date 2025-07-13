const express = require('express');
const FollowupAutomation = require('../models/FollowupAutomation');
const { Configuration, OpenAIApi } = require('openai');
const router = express.Router();

// POST /api/bi/variant-trend-prediction
router.post('/variant-trend-prediction', async (req, res) => {
  const { variantHistory } = req.body;
  if (!variantHistory || !Array.isArray(variantHistory)) return res.status(400).json({ error: 'Chybí data.' });
  try {
    // Připrav prompt pro AI
    const prompt = `Na základě těchto historických dat o retenci varianty follow-up zprávy predikuj trend na další měsíc. Data: ${JSON.stringify(variantHistory)}. Odpověz pouze predikovanou hodnotou retence v procentech a krátkým komentářem.`;
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const aiRes = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Jsi expert na retention analytics.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 120
    });
    const prediction = aiRes.data.choices[0].message.content.trim();
    res.json({ prediction });
  } catch (e) {
    res.status(500).json({ error: 'Chyba AI predikce: ' + e.message });
  }
});

module.exports = router;
