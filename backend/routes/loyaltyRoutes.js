const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LoyaltyPoints = require('../models/LoyaltyPoints');
const { createNotification } = require('../utils/notificationUtils');
const { sendPushNotification } = require('../utils/pushUtils');
const { LeaderboardEntry } = require('../models/Gamification');

// Pomocná funkce pro výpočet úrovně a odznaků
function getLevel(points) {
  if (points >= 500) return 5;
  if (points >= 250) return 4;
  if (points >= 100) return 3;
  if (points >= 50) return 2;
  return 1;
}
function getBadges(points, history) {
  const badges = [];
  if (points >= 10) badges.push('Prvních 10 bodů');
  if (points >= 50) badges.push('50 bodů');
  if (points >= 100) badges.push('100 bodů');
  if (history && history.some(h => h.reason && h.reason.toLowerCase().includes('servis'))) badges.push('První servis');
  return badges;
}

// GET /api/loyalty - získání bodů přihlášeného uživatele
router.get('/', auth, async (req, res) => {
  try {
    let points = await LoyaltyPoints.findOne({ userId: req.user.id });
    if (!points) {
      points = new LoyaltyPoints({ userId: req.user.id, points: 0, history: [] });
      await points.save();
    }
    res.json(points);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// POST /api/loyalty/add - přidání bodů (např. po servisu, doporučení)
router.post('/add', auth, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || isNaN(amount)) return res.status(400).json({ msg: 'Neplatná hodnota bodů.' });
    let points = await LoyaltyPoints.findOne({ userId: req.user.id });
    if (!points) {
      points = new LoyaltyPoints({ userId: req.user.id, points: 0, history: [] });
    }
    points.points += Number(amount);
    points.history.push({ date: new Date(), amount: Number(amount), reason });
    await points.save();
    await createNotification({
      user: req.user.id,
      type: 'loyalty',
      message: `Získali jste ${amount} bodů do věrnostního programu! (${reason})`
    });
    // Push notifikace
    await sendPushNotification(req.user.id, 'Věrnostní body', `Získali jste ${amount} bodů! (${reason})`);
    // Přidělit body za věrnostní akci
    await LeaderboardEntry.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { points: 2 }, $set: { lastUpdate: new Date() } },
      { upsert: true, new: true }
    );
    res.json(points);
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

// GET /api/loyalty/gamification - úroveň a odznaky
router.get('/gamification', auth, async (req, res) => {
  try {
    let points = await LoyaltyPoints.findOne({ userId: req.user.id });
    if (!points) {
      points = new LoyaltyPoints({ userId: req.user.id, points: 0, history: [], badges: [], level: 1 });
      await points.save();
    }
    // Výpočet úrovně a odznaků
    const level = getLevel(points.points);
    const badges = getBadges(points.points, points.history);
    // Uložení, pokud se změnilo
    let changed = false;
    if (points.level !== level) { points.level = level; changed = true; }
    if (JSON.stringify(points.badges) !== JSON.stringify(badges)) { points.badges = badges; changed = true; }
    if (changed) await points.save();
    res.json({ level, badges });
  } catch (err) {
    res.status(500).json({ msg: 'Chyba serveru.' });
  }
});

module.exports = router;
