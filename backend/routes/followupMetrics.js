const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const Campaign = require('../models/Campaign');
// GET /api/admin/followup-metrics-export
router.get('/followup-metrics-export', async (req, res) => {
  try {
    const Campaign = require('../models/Campaign');
    // Najít všechny follow-up kampaně
    const campaigns = await Campaign.find({ launchedBy: 'alert-followup' });
    const rows = campaigns.map(c => {
      const v = c.variants[0] || {};
      return {
        tema: c.tema,
        segment: JSON.stringify(c.segment),
        sent: v.sentCount || 0,
        clicks: v.clickCount || 0,
        ctr: v.sentCount ? (v.clickCount / v.sentCount) : 0,
        createdAt: c.createdAt,
        scheduledAt: c.scheduledAt
      };
    });
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('followup-metrics.csv');
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: 'Chyba při exportu metrik.' });
  }
});

module.exports = router;

// GET /api/admin/followup-metrics/:campaignId
router.get('/followup-metrics/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Kampaň nenalezena' });
    const variant = campaign.variants[0];
    const sent = variant?.sentCount || 0;
    const clicks = variant?.clickCount || 0;
    const ctr = sent > 0 ? (clicks / sent) : 0;
    res.json({ sent, clicks, ctr });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při načítání metrik.' });
  }
});

module.exports = router;
