const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();

// GET /api/bi/alerts - vrátí poslední BI/AI alerty
router.get('/', async (req, res) => {
  try {
    const alerts = await Notification.find({ type: 'bi_alert' })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ alerts });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání alertů.' });
  }
});

module.exports = router;
