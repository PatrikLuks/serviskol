const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const auditLog = require('../middleware/auditLog');

// POST /api/users/push-token - registrace/aktualizace push tokenu
router.post('/push-token', auth, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ msg: 'Token je povinný.' });
  await User.findByIdAndUpdate(req.user.id, { pushToken: token });
  res.json({ success: true });
});

// POST /api/users/notification-channel - změna preferovaného kanálu
router.post('/notification-channel', auth, async (req, res) => {
  const { channel } = req.body;
  if (!['in-app', 'email', 'push'].includes(channel)) return res.status(400).json({ msg: 'Neplatný kanál.' });
  await User.findByIdAndUpdate(req.user.id, { notificationChannel: channel });
  auditLog('Změna kanálu notifikací', req.user, { channel });
  res.json({ success: true });
});

module.exports = router;
