const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const { adminOnly, adminRole } = require('../middleware/auth');

// GET /api/admin/api-keys - seznam API klíčů adminů
router.get('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const users = await User.find(
    { role: 'admin', apiKey: { $exists: true, $ne: null } },
    'email apiKey apiKeyPermissions createdAt'
  ).lean();
  res.json(users);
});

// POST /api/admin/api-keys - vygenerovat nový API klíč pro admina
router.post('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { email, permissions } = req.body;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) return res.status(404).json({ error: 'Admin nenalezen.' });
  // Vygenerovat nový klíč
  const apiKey = crypto.randomBytes(32).toString('hex');
  user.apiKey = apiKey;
  user.apiKeyPermissions = Array.isArray(permissions) ? permissions : [];
  await user.save();
  res.json({ email: user.email, apiKey, permissions: user.apiKeyPermissions });
});

// DELETE /api/admin/api-keys/:email - revokovat API klíč
router.delete('/:email', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) return res.status(404).json({ error: 'Admin nenalezen.' });
  user.apiKey = null;
  user.apiKeyPermissions = [];
  await user.save();
  res.json({ ok: true });
});

module.exports = router;
