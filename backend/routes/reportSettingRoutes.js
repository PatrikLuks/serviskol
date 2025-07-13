const express = require('express');
const router = express.Router();
const ReportSetting = require('../models/ReportSetting');
const { adminOnly, adminRole } = require('../middleware/auth');

// GET /api/admin/report-settings
router.get('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const settings = await ReportSetting.find({}).lean();
  res.json(settings);
});

// POST /api/admin/report-settings
router.post('/', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt } = req.body;
  const setting = new ReportSetting({ emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt, createdBy: req.user._id });
  await setting.save();
  res.json(setting);
});

// PATCH /api/admin/report-settings/:id
router.patch('/:id', adminOnly, adminRole('superadmin'), async (req, res) => {
  const { emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt } = req.body;
  const setting = await ReportSetting.findById(req.params.id);
  if (!setting) return res.status(404).json({ error: 'Nastavení nenalezeno.' });
  if (emails) setting.emails = emails;
  if (frequency) setting.frequency = frequency;
  if (enabled !== undefined) setting.enabled = enabled;
  if (enabledSections) setting.enabledSections = enabledSections;
  if (dateFrom) setting.dateFrom = dateFrom;
  if (dateTo) setting.dateTo = dateTo;
  if (scheduledSend !== undefined) setting.scheduledSend = scheduledSend;
  if (lastSentAt) setting.lastSentAt = lastSentAt;
  await setting.save();
  res.json(setting);
});

// DELETE /api/admin/report-settings/:id
router.delete('/:id', adminOnly, adminRole('superadmin'), async (req, res) => {
  await ReportSetting.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
