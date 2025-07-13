const runWebhooksCron = require('../scripts/runWebhooksCron');
// POST /api/admin/webhooks/:id/trigger - ruční spuštění webhooku
router.post('/:id/trigger', adminOnly, adminRole('superadmin'), async (req, res) => {
  const Webhook = require('../models/Webhook');
  const webhook = await Webhook.findById(req.params.id);
  if (!webhook) return res.status(404).json({ error: 'Webhook nenalezen.' });
  const deliver = require('../scripts/runWebhooksCron').__esModule ? require('../scripts/runWebhooksCron').deliverWebhook : require('../scripts/runWebhooksCron').deliverWebhook;
  try {
    await deliver(webhook);
    res.json({ ok: true, status: webhook.lastStatus, response: webhook.lastResponse });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/webhooks/:id/history - výpis historie doručení (z audit logu)
router.get('/:id/history', adminOnly, adminRole('superadmin'), async (req, res) => {
  const AuditLog = require('../models/AuditLog');
  const logs = await AuditLog.find({
    action: 'webhook_deliver',
    'details.webhookId': req.params.id
  }).sort({ createdAt: -1 }).lean();
  res.json(logs);
});
const express = require('express');
const router = express.Router();
const Webhook = require('../models/Webhook');
const { adminOnly, adminRole } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

// GET /api/admin/webhooks - seznam webhooků
router.get('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const webhooks = await Webhook.find().populate('createdBy', 'email name').sort({ createdAt: -1 }).lean();
  res.json(webhooks);
});

// POST /api/admin/webhooks - vytvořit nový webhook
router.post('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { url, event, format, filter, frequency } = req.body;
  const webhook = await Webhook.create({
    url, event, format, filter, frequency, createdBy: req.user._id
  });
  await AuditLog.create({
    action: 'webhook_create',
    performedBy: req.user._id,
    details: { url, event, format, filter, frequency }
  });
  res.json(webhook);
});

// DELETE /api/admin/webhooks/:id - smazat webhook
router.delete('/:id', adminOnly, adminRole('superadmin'), async (req, res) => {
  const webhook = await Webhook.findByIdAndDelete(req.params.id);
  if (webhook) {
    await AuditLog.create({
      action: 'webhook_delete',
      performedBy: req.user._id,
      details: { webhookId: webhook._id, url: webhook.url }
    });
  }
  res.json({ ok: true });
});

// PATCH /api/admin/webhooks/:id - aktivace/deaktivace
router.patch('/:id', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { active } = req.body;
  const webhook = await Webhook.findByIdAndUpdate(req.params.id, { active }, { new: true });
  await AuditLog.create({
    action: 'webhook_update',
    performedBy: req.user._id,
    details: { webhookId: webhook._id, active }
  });
  res.json(webhook);
});

module.exports = router;
