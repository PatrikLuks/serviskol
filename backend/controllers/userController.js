
const userService = require('../services/userService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    await userService.registerUser({ name, email, password, role });
    res.status(201).json({ msg: 'Registrace úspěšná.' });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Přihlášení uživatele
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser({ email, password, ip: req.ip });
    if (result.twoFactorRequired) {
      return res.status(401).json({ twoFactorRequired: true, userId: result.userId });
    }
    const { token, user } = result;
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, twoFactorEnabled: user.twoFactorEnabled } });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Přihlášení pomocí 2FA (TOTP)
exports.login2FA = async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const result = await userService.login2FA({ email, password, token, ip: req.ip });
    res.json({ token: result.token, user: { id: result.user._id, name: result.user.name, email: result.user.email, role: result.user.role, twoFactorEnabled: result.user.twoFactorEnabled } });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};

// Admin: změna role uživatele
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, newRole } = req.body;
    await userService.changeUserRole({ adminUser: req.user, userId, newRole });
    res.json({ msg: 'Role změněna.' });
  } catch (err) {
    if (err.message === 'Pouze admin může měnit role.') {
      return res.status(403).json({ msg: err.message });
    }
    if (err.message === 'Uživatel nenalezen.') {
      return res.status(404).json({ msg: err.message });
    }
    if (err.message === 'Neplatná role.') {
      return res.status(400).json({ msg: err.message });
    }
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};
