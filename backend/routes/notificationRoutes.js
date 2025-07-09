const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// GET /api/notifications - seznam notifikací pro přihlášeného uživatele
router.get('/', auth, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// POST /api/notifications/mark-read - označení notifikací jako přečtené
router.post('/mark-read', auth, async (req, res) => {
  const { ids } = req.body;
  await Notification.updateMany({ user: req.user._id, _id: { $in: ids } }, { $set: { read: true } });
  res.json({ success: true });
});

module.exports = router;
