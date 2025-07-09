const express = require('express');
const router = express.Router();

// Healthcheck endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
