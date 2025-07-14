const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateRegister, validateLogin } = require('../middleware/validateUser');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const { LeaderboardEntry } = require('../models/Gamification');

// Registrace
router.post('/register', validateRegister, userController.register);
// Přihlášení
router.post('/login', validateLogin, userController.login);
// Přihlášení s 2FA
router.post('/2fa/verify-login', userController.login2FA);
// GET /api/users/mechanics - seznam techniků
router.get('/mechanics', auth, async (req, res) => {
  try {
    const mechanics = await User.find({ role: 'mechanic' }, '_id name email');
    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});
// Vrátí aktuálně přihlášeného uživatele
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role');
    if (!user) return res.status(404).json({ msg: 'Uživatel nenalezen.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});
// Admin: změna role uživatele
router.post('/change-role', auth, userController.changeUserRole);
// Po úspěšném dokončení onboardingu přidělit body
router.post('/onboarding/complete', auth, async (req, res) => {
  try {
    // Přidělit body za onboarding
    await LeaderboardEntry.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { points: 15 }, $set: { lastUpdate: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ msg: 'Body za onboarding byly úspěšně přiděleny.' });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru při přidělování bodů.' });
  }
});

module.exports = router;
