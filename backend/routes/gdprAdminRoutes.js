const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Bike = require('../models/Bike');
const ServiceRequest = require('../models/ServiceRequest');
const Message = require('../models/Message');
const auditLog = require('../middleware/auditLog');

// GET /api/gdpr/requests - seznam žádostí o výmaz (admin)
router.get('/requests', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Pouze pro admina.' });
  // Pro jednoduchost: audit logy s akcí GDPR žádost o výmaz
  const fs = require('fs');
  const path = require('path');
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return res.json([]);
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const requests = lines.map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(l => l && l.action === 'GDPR žádost o výmaz');
  res.json(requests.reverse());
});

// POST /api/gdpr/delete-user - admin smaže uživatele
router.post('/delete-user', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Pouze pro admina.' });
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ msg: 'Chybí userId.' });
  await Message.deleteMany({ fromUserId: userId });
  await ServiceRequest.deleteMany({ userId });
  await Bike.deleteMany({ ownerId: userId });
  await User.deleteOne({ _id: userId });
  auditLog('GDPR výmaz účtu', req.user, { deletedUser: userId });
  res.json({ success: true });
});

module.exports = router;
