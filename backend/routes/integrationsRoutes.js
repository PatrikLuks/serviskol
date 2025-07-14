const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// GET /api/integrations/weather?lat=...&lon=...
router.get('/weather', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    // Placeholder odpověď, zde by bylo volání OpenWeatherMap API
    if (!lat || !lon) return res.status(400).json({ msg: 'Chybí souřadnice.' });
    res.json({
      location: { lat, lon },
      weather: 'Slunečno',
      temperature: 23,
      icon: '☀️',
      description: 'Zatím pouze demo, připraveno na napojení na OpenWeatherMap.'
    });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
