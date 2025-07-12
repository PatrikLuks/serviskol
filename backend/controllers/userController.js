const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auditLog } = require('../middleware/auditLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Uživatel již existuje.' });
    const user = new User({ name, email, passwordHash: password, role });
    await user.save();
    res.status(201).json({ msg: 'Registrace úspěšná.' });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};

// Přihlášení uživatele
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.error('Chybí email nebo heslo:', req.body);
      return res.status(400).json({ msg: 'Chybí email nebo heslo.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      auditLog('Neúspěšné přihlášení', { email }, { ip: req.ip });
      return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      auditLog('Neúspěšné přihlášení', user, { ip: req.ip });
      return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    }
    // Povinné 2FA pro adminy a techniky
    if ((user.role === 'admin' || user.role === 'mechanic') && !user.twoFactorEnabled) {
      return res.status(403).json({ msg: 'Pro tuto roli je povinné dvoufázové ověření. Aktivujte si 2FA.' });
    }
    if (user.twoFactorEnabled) {
      // 2FA je aktivní, vyžadujeme další krok
      return res.status(401).json({ twoFactorRequired: true, userId: user._id });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '7d' });
    auditLog('Přihlášení', user, { ip: req.ip });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled } });
  } catch (err) {
    console.error('Chyba při loginu:', err, req.body);
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};

// Přihlášení pomocí 2FA (TOTP)
exports.login2FA = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    if (!user.twoFactorEnabled || !user.twoFactorSecret) return res.status(400).json({ msg: '2FA není aktivní.' });
    const verified = require('speakeasy').totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    if (!verified) {
      auditLog('2FA ověření neúspěšné při loginu', user, { ip: req.ip });
      return res.status(400).json({ msg: 'Neplatný 2FA kód.' });
    }
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '7d' });
    auditLog('Přihlášení s 2FA', user, { ip: req.ip });
    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled } });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};

// Admin: změna role uživatele
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Pouze admin může měnit role.' });
    if (!['client', 'mechanic', 'admin'].includes(newRole)) return res.status(400).json({ msg: 'Neplatná role.' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'Uživatel nenalezen.' });
    const oldRole = user.role;
    user.role = newRole;
    await user.save();
    const { alertAdmins } = require('../utils/notificationUtils');
    await alertAdmins({ subject: 'Změna role uživatele', text: `Uživatel ${user.email} změnil roli z ${oldRole} na ${newRole}.` });
    auditLog('Změna role', req.user, { userId, oldRole, newRole });
    res.json({ msg: 'Role změněna.' });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};
