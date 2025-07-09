const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditLog = require('../middleware/auditLog');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Uživatel již existuje.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, passwordHash, role });
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
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Nesprávný email nebo heslo.' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'tajnyklic', { expiresIn: '7d' });
    auditLog('Přihlášení', user, { ip: req.ip });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
};
