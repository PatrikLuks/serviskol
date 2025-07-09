const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

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
    res.json({ recommendation: aiRecommendation });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
