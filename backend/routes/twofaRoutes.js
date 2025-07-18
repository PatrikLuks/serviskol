const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getModel } = require('../db');
const User = getModel('User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { auditLog } = require('../middleware/auditLog');
const { captureEvent } = require('../utils/posthog');

// POST /api/2fa/setup - vygeneruje secret a QR pro aktivaci
router.post('/setup', auth, async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `ServisKol (${req.user.email})` });
  await User.findByIdAndUpdate(req.user.id, { twoFactorSecret: secret.base32 });
  const qr = await qrcode.toDataURL(secret.otpauth_url);
  auditLog('2FA setup', req.user);
  captureEvent(req.user._id?.toString() || req.user.id, '2fa_setup', { email: req.user.email });
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
    captureEvent(user._id?.toString() || user.id, '2fa_enabled', { email: user.email });
    return res.json({ success: true });
  } else {
    auditLog('2FA ověření neúspěšné', user);
    captureEvent(user._id?.toString() || user.id, '2fa_verify_failed', { email: user.email });
    return res.status(400).json({ msg: 'Neplatný kód.' });
  }
});

// POST /api/2fa/disable - deaktivace 2FA
router.post('/disable', auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { twoFactorEnabled: false, twoFactorSecret: null });
  auditLog('2FA deaktivováno', req.user);
  captureEvent(req.user._id?.toString() || req.user.id, '2fa_disabled', { email: req.user.email });
  res.json({ success: true });
});

module.exports = router;
