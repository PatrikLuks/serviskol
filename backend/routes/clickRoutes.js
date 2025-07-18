const express = require('express');
const router = express.Router();
const { auditLog } = require('../middleware/auditLog');
const { auth } = require('../middleware/auth');

// GET /api/click?faq=...&campaign=...&redirect=...
const { getModel } = require('../db');
const Campaign = getModel('Campaign');
const User = getModel('User');
router.get('/', auth, async (req, res) => {
  const { faq, campaign, redirect, variant } = req.query;
  const user = req.user;
  if (!faq || !redirect) return res.status(400).send('Chybí parametr faq nebo redirect.');
  // Audit log
  auditLog('Kampaň - kliknutí', user, {
    faq,
    campaign: campaign || null,
    timestamp: new Date().toISOString()
  });
  // Aktualizace clickCount v Campaign (dle campaign a faq)
  if (campaign) {
    try {
      await Campaign.updateOne(
        { tema: campaign, 'variants.faq': faq },
        { $inc: { 'variants.$.clickCount': 1 } }
      );
    } catch (e) {
      // log error, ale neblokovat redirect
      console.error('Chyba při aktualizaci clickCount:', e);
    }
  }
  // Uložit proklik do profilu uživatele
  try {
    await User.updateOne(
      { _id: user._id },
      { $push: { campaignClicks: {
        campaign: campaign || null,
        variant: variant || null,
        faq: faq || null,
        clickedAt: new Date()
      } } }
    );
  } catch (e) {
    console.error('Chyba při ukládání campaignClicks:', e);
  }
  res.redirect(redirect);
});

module.exports = router;
