
// Naplánuje A/B test follow-up zpráv pro segment a kanál
router.post('/alert-logs/execute-segment-followup-ab', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const Campaign = require('../models/Campaign');
  const { segment, channel, variants, scheduledAt } = req.body;
  if (!segment || !channel || !Array.isArray(variants) || variants.length < 2) return res.status(400).json({ error: 'Chybí segment, kanál nebo varianty.' });
  try {
    // Vytvořit AlertLog
    const log = new AlertLog({
      admin: userId,
      type: 'low-ctr-segment',
      actionType: 'followup-ab',
      segment,
      channel,
      createdAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      audit: [{ event: 'manual-segment-followup-ab', at: new Date(), by: userId }],
      abVariants: variants
    });
    await log.save();
    // Pokud je scheduledAt v budoucnosti, pouze uložit a neprovádět hned
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      log.actionResult = 'scheduled';
      log.actionExecutedAt = null;
      await log.save();
      return res.json({ result: 'scheduled' });
    }
    // Jinak provést ihned
    const CampaignModel = require('../models/Campaign');
    const campaign = new CampaignModel({
      tema: `A/B test follow-up: ${channel}`,
      segment,
      variants: variants.map((v, i) => ({ label: v.label, text: v.text, channel, sentCount: 0, clickCount: 0 })),
      type: 'ab',
      launchedBy: 'manual-segment-followup-ab',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
    });
    await campaign.save();
    log.campaignId = campaign._id;
    log.actionResult = 'success';
    log.actionExecutedAt = new Date();
    await log.save();
    res.json({ result: 'success', campaignId: campaign._id });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při plánování A/B testu.' });
  }
});
// Spustí follow-up kampaň pro zadaný segment a kanál (vytvoří AlertLog a Campaign)
router.post('/alert-logs/execute-segment-followup', adminOnly, async (req, res) => {
  const userId = req.user?._id;
  const AlertLog = require('../models/AlertLog');
  const Campaign = require('../models/Campaign');
  const { segment, channel, scheduledAt } = req.body;
  if (!segment || !channel) return res.status(400).json({ error: 'Chybí segment nebo kanál.' });
  try {
    // Vytvořit AlertLog
    const log = new AlertLog({
      admin: userId,
      type: 'low-ctr-segment',
      actionType: 'followup',
      segment,
      channel,
      createdAt: new Date(),
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      audit: [{ event: 'manual-segment-followup', at: new Date(), by: userId }]
    });
    await log.save();
    // Pokud je scheduledAt v budoucnosti, pouze uložit a neprovádět hned
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      log.actionResult = 'scheduled';
      log.actionExecutedAt = null;
      await log.save();
      return res.json({ result: 'scheduled' });
    }
    // Jinak provést ihned
    const CampaignModel = require('../models/Campaign');
    const campaign = new CampaignModel({
      tema: `Follow-up: ${channel}`,
      segment,
      variants: [{ label: 'A', text: 'Děkujeme za zpětnou vazbu, rádi bychom vás znovu oslovili.', channel, sentCount: 0, clickCount: 0 }],
      type: 'auto',
      launchedBy: 'manual-segment-followup',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
    });
    await campaign.save();
    log.campaignId = campaign._id;
    log.actionResult = 'success';
    log.actionExecutedAt = new Date();
    await log.save();
    res.json({ result: 'success', campaignId: campaign._id });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při spouštění follow-upu.' });
  }
});
