const express = require('express');
const { getModel } = require('../db');
const FollowupAutomation = getModel('FollowupAutomation');
const AuditLog = getModel('AuditLog');
const router = express.Router();

// POST /api/bi/alerts/activate-variant
router.post('/activate-variant', async (req, res) => {
  const { automationId, variantText } = req.body;
  if (!automationId || !variantText) return res.status(400).json({ error: 'Chybí parametry.' });
  try {
    const automation = await FollowupAutomation.findById(automationId);
    if (!automation) return res.status(404).json({ error: 'Automatizace nenalezena.' });
    const newLabel = `AI-${new Date().toISOString().slice(0,16).replace(/[-T:]/g,'')}`;
    automation.variants.push({ label: newLabel, messageTemplate: variantText, active: true });
    await automation.save();
    await AuditLog.create({
      action: 'add_ai_variant',
      performedBy: null,
      details: { automationId, label: newLabel, messageTemplate: variantText },
      createdAt: new Date()
    });
    res.json({ success: true, label: newLabel });
  } catch (e) {
    res.status(500).json({ error: 'Chyba aktivace varianty: ' + e.message });
  }
});

module.exports = router;
