const express = require('express');
const router = express.Router();
const { getModel } = require('../db');
const ReportSetting = getModel('ReportSetting');
const { auth, adminOnly, adminRole } = require('../middleware/auth');
const User = getModel('User');
const { auditLog } = require('../middleware/auditLog');
const AuditLog = getModel('AuditLog');
const { mongoose } = require('../db');

// GET /api/admin/report-settings
router.get('/', auth, adminOnly, adminRole('superadmin'), async (req, res) => {
  const settings = await ReportSetting.find({}).lean();
  res.json(settings);
});

// POST /api/admin/report-settings
router.post('/', auth, adminOnly, adminRole('superadmin'), async (req, res) => {
  const { emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt } = req.body;
  const setting = new ReportSetting({ emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt, createdBy: req.user._id });
  await setting.save();
  // Audit log soubor
  auditLog('Vytvoření report settingu', req.user, { settingId: setting._id, emails, frequency });
  // Audit log MongoDB
  console.log('DEBUG mongoose.connection.name při zápisu CREATE:', mongoose.connection.name);
  try {
    const auditResult = await AuditLog.create({
      action: 'Vytvoření report settingu',
      performedBy: new mongoose.Types.ObjectId(req.user._id),
      details: { settingId: setting._id, emails, frequency }
    });
    console.log('DEBUG AuditLog zápis CREATE:', auditResult);
  } catch (err) {
    console.error('DEBUG AuditLog chyba CREATE:', err);
  }
  res.status(201).json(setting);
});

// PATCH /api/admin/report-settings/:id
router.patch('/:id', auth, adminOnly, adminRole('superadmin'), async (req, res) => {
  const { emails, frequency, enabled, enabledSections, dateFrom, dateTo, scheduledSend, lastSentAt } = req.body;
  const setting = await ReportSetting.findById(req.params.id);
  if (!setting) return res.status(404).json({ error: 'Nastavení nenalezeno.' });
  const before = { ...setting.toObject() };
  if (emails) setting.emails = emails;
  if (frequency) setting.frequency = frequency;
  if (enabled !== undefined) setting.enabled = enabled;
  if (enabledSections) setting.enabledSections = enabledSections;
  if (dateFrom) setting.dateFrom = dateFrom;
  if (dateTo) setting.dateTo = dateTo;
  if (scheduledSend !== undefined) setting.scheduledSend = scheduledSend;
  if (lastSentAt) setting.lastSentAt = lastSentAt;
  await setting.save();
  // Audit log soubor
  auditLog('Úprava report settingu', req.user, { settingId: setting._id, before, after: setting.toObject() });
  // Audit log MongoDB
  console.log('DEBUG mongoose.connection.name při zápisu PATCH:', mongoose.connection.name);
  try {
    const auditResult = await AuditLog.create({
      action: 'Úprava report settingu',
      performedBy: new mongoose.Types.ObjectId(req.user._id),
      details: { settingId: setting._id, before, after: setting.toObject() }
    });
    console.log('DEBUG AuditLog zápis PATCH:', auditResult);
  } catch (err) {
    console.error('DEBUG AuditLog chyba PATCH:', err);
  }
  res.json(setting);
});

// DELETE /api/admin/report-settings/:id
router.delete('/:id', auth, adminOnly, adminRole('superadmin'), async (req, res) => {
  const setting = await ReportSetting.findById(req.params.id);
  if (!setting) return res.status(404).json({ error: 'Nastavení nenalezeno.' });
  await ReportSetting.findByIdAndDelete(req.params.id);
  // Audit log soubor
  auditLog('Smazání report settingu', req.user, { settingId: setting._id, deleted: setting.toObject() });
  // Audit log MongoDB
  console.log('DEBUG mongoose.connection.name při zápisu DELETE:', mongoose.connection.name);
  try {
    const auditResult = await AuditLog.create({
      action: 'Smazání report settingu',
      performedBy: new mongoose.Types.ObjectId(req.user._id),
      details: { settingId: setting._id, deleted: setting.toObject() }
    });
    console.log('DEBUG AuditLog zápis DELETE:', auditResult);
  } catch (err) {
    console.error('DEBUG AuditLog chyba DELETE:', err);
  }
  res.json({ ok: true });
});

module.exports = router;
