const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');

// GET /api/audit/logs - pouze pro adminy
router.get('/logs', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Pouze pro admina.' });
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.json([]);
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const logs = lines.map(line => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);
  res.json(logs.slice(-200).reverse()); // posledních 200 záznamů, nejnovější první
});

module.exports = router;
