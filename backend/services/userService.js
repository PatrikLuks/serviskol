const { getModel } = require('../db');
const User = getModel('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auditLog } = require('../middleware/auditLog');
const { captureEvent } = require('../utils/posthog');
const { sendAdminNotification } = require('../utils/notificationUtils');

async function registerUser({ name, email, password, role }) {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('Uživatel již existuje.');
  const user = new User({ name, email, passwordHash: password, role });
  await user.save();
  captureEvent(user._id.toString(), 'register', { email, role });
  return user;
}

async function loginUser({ email, password, ip }) {
  if (!email || !password) throw new Error('Chybí email nebo heslo.');
  const user = await User.findOne({ email });
  if (!user) {
    auditLog('Neúspěšné přihlášení', { email }, { ip });
    throw new Error('Nesprávný email nebo heslo.');
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    auditLog('Neúspěšné přihlášení', user, { ip });
    throw new Error('Nesprávný email nebo heslo.');
  }
  // Dočasně povoleno přihlášení adminů a mechaniků i bez 2FA (pro vývoj)
  // if ((user.role === 'admin' || user.role === 'mechanic') && !user.twoFactorEnabled) {
  //   throw new Error('Pro tuto roli je povinné dvoufázové ověření. Aktivujte si 2FA.');
  // }
  if (user.twoFactorEnabled) {
    return { twoFactorRequired: true, userId: user._id };
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '7d' });
  auditLog('Přihlášení', user, { ip });
  captureEvent(user._id.toString(), 'login', { email, role: user.role });
  return { token, user };
}

async function login2FA({ email, password, token: totpToken, ip }) {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Nesprávný email nebo heslo.');
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error('Nesprávný email nebo heslo.');
  if (!user.twoFactorEnabled || !user.twoFactorSecret) throw new Error('2FA není aktivní.');
  const verified = require('speakeasy').totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: totpToken
  });
  if (!verified) {
    auditLog('2FA ověření neúspěšné při loginu', user, { ip });
    throw new Error('Neplatný 2FA kód.');
  }
  const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '7d' });
  auditLog('Přihlášení s 2FA', user, { ip });
  return { token: jwtToken, user };
}

async function changeUserRole({ adminUser, userId, newRole }) {
  if (adminUser.role !== 'admin') throw new Error('Pouze admin může měnit role.');
  if (!['client', 'mechanic', 'admin'].includes(newRole)) throw new Error('Neplatná role.');
  const user = await User.findById(userId);
  if (!user) throw new Error('Uživatel nenalezen.');
  const oldRole = user.role;
  user.role = newRole;
  await user.save();
  await sendAdminNotification({ subject: 'Změna role uživatele', text: `Uživatel ${user.email} změnil roli z ${oldRole} na ${newRole}.` });
  auditLog('Změna role', adminUser, { userId, oldRole, newRole });
  return user;
}

module.exports = { registerUser, loginUser, login2FA, changeUserRole };
