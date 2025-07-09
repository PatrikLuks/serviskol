const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validateUser');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Registrace
router.post('/register', validateRegister, userController.register);
// Přihlášení
router.post('/login', validateLogin, userController.login);
// GET /api/users/mechanics - seznam techniků
router.get('/mechanics', auth, async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }, '_id name email');
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
