const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/export-stats', (req, res) => {
  const statsPath = path.join(__dirname, '../reports/export-stats.json');
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    res.json(stats);
  } else {
    res.status(404).json({ error: 'Statistiky nenalezeny.' });
  }
});

module.exports = router;
