const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const auditLog = require('../middleware/auditLog');

// POST /api/2fa/setup - vygeneruje secret a QR pro aktivaci
router.post('/setup', auth, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `ServisKol (${req.user.email})` });
  await User.findByIdAndUpdate(req.user.id, { twoFactorSecret: secret.base32 });
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  auditLog('2FA setup', req.user);
  res.json({ qr, secret: secret.base32 });
});

// POST /api/2fa/verify - ověření kódu a aktivace 2FA
router.post('/verify', auth, async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user.id);
  if (!user.twoFactorSecret) return res.status(400).json({ msg: '2FA není inicializováno.' });
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token
  });
  if (verified) {
    user.twoFactorEnabled = true;
    await user.save();
    auditLog('2FA aktivováno', user);
    return res.json({ success: true });
  } else {
    auditLog('2FA ověření neúspěšné', user);
    return res.status(400).json({ msg: 'Neplatný kód.' });
  }
});

// POST /api/2fa/disable - deaktivace 2FA
router.post('/disable', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { twoFactorEnabled: false, twoFactorSecret: null });
  auditLog('2FA deaktivováno', req.user);
  res.json({ success: true });
});

module.exports = router;
