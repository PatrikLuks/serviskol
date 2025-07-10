const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Healthcheck endpoint
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
