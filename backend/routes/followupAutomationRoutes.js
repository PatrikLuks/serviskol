const express = require('express');
const router = express.Router();
const FollowupAutomation = require('../models/FollowupAutomation');
const { auth } = require('../middleware/auth');
// Nastavit variantu jako výchozí (přesune na začátek pole variants)
router.post('/:id/set-default-variant', auth, async (req, res) => {
  const { label } = req.body;
  const automation = await FollowupAutomation.findById(req.params.id);
  if (!automation || !Array.isArray(automation.variants)) return res.status(404).json({ error: 'Automatizace nebo varianty nenalezeny' });
  const idx = automation.variants.findIndex(v => v.label === label);
  if (idx === -1) return res.status(404).json({ error: 'Varianta nenalezena' });
  const [variant] = automation.variants.splice(idx, 1);
  automation.variants.unshift(variant);
  await automation.save();
  res.json({ ok: true });
});

// Seznam všech automatizací
router.get('/', auth, async (req, res) => {
  const automations = await FollowupAutomation.find().lean();
  res.json(automations);
});

// Vytvoření nové automatizace
router.post('/', auth, async (req, res) => {
  const { triggerSegment, channel, messageTemplate, active } = req.body;
  const a = await FollowupAutomation.create({ triggerSegment, channel, messageTemplate, active });
  res.json(a);
});

// Editace automatizace
router.patch('/:id', auth, async (req, res) => {
  const a = await FollowupAutomation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(a);
});

// Smazání automatizace
router.delete('/:id', auth, async (req, res) => {
  await FollowupAutomation.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
