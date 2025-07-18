// Endpoint pro automatické vyhodnocení vítěze A/B testu a možnost rozeslat vítěze všem
const express = require('express');
const router = express.Router();
const { getModel } = require('../db');
const Campaign = getModel('Campaign');

// Automaticky označí vítěze podle CTR a/nebo rozesílá vítěze všem
router.post('/ab-followup-select-winner', async (req, res) => {
  const { campaignId, autoSend } = req.body;
  if (!campaignId) return res.status(400).json({ error: 'Chybí campaignId.' });
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.type !== 'ab') return res.status(404).json({ error: 'Kampaň nenalezena.' });
  // Najít variantu s nejvyšším CTR (alespoň 20 odeslání)
  let winner = null, bestCtr = -1;
  for (const v of campaign.variants) {
    const ctr = v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0;
    if (v.sentCount >= 20 && ctr > bestCtr) {
      bestCtr = ctr;
      winner = v.label;
    }
  }
  if (!winner) return res.status(400).json({ error: 'Žádná varianta nesplňuje podmínky pro vítěze.' });
  campaign.winnerVariant = winner;
  campaign.status = autoSend ? 'winner_sent' : 'sent';
  await campaign.save();
  // Pokud autoSend, vytvořit novou kampaň s vítěznou variantou a rozeslat všem v segmentu
  let newCampaignId = null;
  if (autoSend) {
    const winnerVariant = campaign.variants.find(v => v.label === winner);
    if (!winnerVariant) return res.status(500).json({ error: 'Vítězná varianta nenalezena.' });
    const newCampaign = new Campaign({
      tema: `Vítězný follow-up: ${campaign.segment.role || ''} ${campaign.segment.region || ''}`,
      segment: campaign.segment,
      variants: [{ ...winnerVariant.toObject(), label: 'WINNER' }],
      type: 'auto',
      launchedBy: 'ab-winner',
      scheduledAt: new Date(),
      status: 'sent'
    });
    await newCampaign.save();
    newCampaignId = newCampaign._id;
  }
  res.json({ winner, newCampaignId });
});

module.exports = router;
