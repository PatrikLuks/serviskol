const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// POST /api/feedback
router.post('/', (req, res) => {
  const { message, email } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Zpětná vazba je povinná.' });
  }
  const feedback = {
    message,
    email: email || null,
    date: new Date().toISOString(),
    ip: req.ip
  };
  const logPath = path.join(__dirname, '../logs/feedback.log');
  fs.appendFile(logPath, JSON.stringify(feedback) + '\n', err => {
    if (err) {
      return res.status(500).json({ error: 'Chyba při ukládání zpětné vazby.' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
