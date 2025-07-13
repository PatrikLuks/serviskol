const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

// POST /api/admin/followup-automation/ai-suggest
router.post('/ai-suggest', async (req, res) => {
  const { segment, variantLabel } = req.body;
  if (!process.env.OPENAI_API_KEY) return res.status(400).json({ error: 'OpenAI API key není nastaven.' });
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Navrhni krátkou, motivační zprávu pro uživatele v segmentu "${segment}". Styl: přátelský, akční, personalizovaný. Pokud je varianta pojmenovaná, zohledni ji: ${variantLabel || ''}`;
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80
    });
    const suggestion = completion.data.choices[0].message.content.trim();
    res.json({ suggestion });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při generování šablony AI' });
  }
});

module.exports = router;
