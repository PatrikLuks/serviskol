// Export výsledků A/B testů follow-upů do CSV
const { captureEvent } = require('../utils/posthog');
const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
router.get('/ab-followup-results/export-csv', async (req, res) => {
  const { role, region, ageGroup, channel } = req.query;
  if (!role || !region || !ageGroup || !channel) return res.status(400).json({ error: 'Chybí segment nebo kanál.' });
  const campaigns = await Campaign.find({
    type: 'ab',
    'segment.role': role,
    'segment.region': region,
    'segment.ageGroup': ageGroup,
    'variants.channel': channel
  }).sort({ createdAt: -1 }).limit(50).lean();
  const rows = [];
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      rows.push({
        createdAt: c.createdAt,
        scheduledAt: c.scheduledAt,
        label: v.label,
        text: v.text,
        sentCount: v.sentCount,
        clickCount: v.clickCount,
        ctr: v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0,
        winner: c.winnerVariant === v.label ? 'ANO' : ''
      });
    });
  });
  // Logování exportu do PostHog
  if (req.user) {
    captureEvent(req.user._id?.toString() || req.user.id, 'export_ab_followup_results', {
      role, region, ageGroup, channel, count: campaigns.length
    });
  }
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('ab-followup-results.csv');
  return res.send(csv);
});
// Vrátí výsledky A/B testů follow-upů pro daný segment a kanál

module.exports = router;
router.get('/ab-followup-results', async (req, res) => {
  const { role, region, ageGroup, channel } = req.query;
  if (!role || !region || !ageGroup || !channel) return res.status(400).json({ error: 'Chybí segment nebo kanál.' });
  // Najít kampaně typu ab pro daný segment a kanál
  const campaigns = await Campaign.find({
    type: 'ab',
    'segment.role': role,
    'segment.region': region,
    'segment.ageGroup': ageGroup,
    'variants.channel': channel
  }).sort({ createdAt: -1 }).limit(10).lean();
  const results = campaigns.map(c => ({
    createdAt: c.createdAt,
    scheduledAt: c.scheduledAt,
    variants: (c.variants || []).map(v => ({
      label: v.label,
      text: v.text,
      sentCount: v.sentCount,
      clickCount: v.clickCount,
      ctr: v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0
    })),
    winnerVariant: c.winnerVariant || null
  }));
  res.json({ results });
});

module.exports = router;
