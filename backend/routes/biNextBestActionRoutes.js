const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const router = express.Router();

// POST /api/bi/next-best-action
router.post('/next-best-action', async (req, res) => {
  const { variantHistory, segment, channel, lastPrediction } = req.body;
  if (!variantHistory || !segment || !channel) return res.status(400).json({ error: 'Chybí data.' });
  try {
    const prompt = `Na základě těchto dat o variantě follow-up zprávy (historie retence: ${JSON.stringify(variantHistory)}, segment: ${segment}, kanál: ${channel}, poslední AI predikce: ${lastPrediction || 'neznámá'}) navrhni nejlepší další akci pro admina. Možnosti: upravit segmentaci, změnit kanál, vytvořit novou variantu, spustit follow-up kampaň, nebo doporučit jinou strategii. Odpověz konkrétním doporučením a krátkým zdůvodněním.`;
    const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));
    const aiRes = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Jsi expert na retention marketing a BI.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 180
    });
    const nba = aiRes.data.choices[0].message.content.trim();
    res.json({ nba });
  } catch (e) {
    res.status(500).json({ error: 'Chyba AI doporučení: ' + e.message });
  }
});

module.exports = router;
