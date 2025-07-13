const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// GET /api/bi/followup-effectiveness?segment=riziko_odchodu&from=2025-01-01&to=2025-07-13
router.get('/followup-effectiveness', async (req, res) => {
  try {
    const { segment = 'riziko_odchodu', from, to } = req.query;
    const q = { action: 'ai_segment_change', 'details.newSegment': segment };
    if (from || to) {
      q.createdAt = {};
      if (from) q.createdAt.$gte = new Date(from);
      if (to) q.createdAt.$lte = new Date(to);
    }
    // Najdi všechny přechody do segmentu
    const logs = await AuditLog.find(q).lean();
    const userIds = logs.map(l => l.performedBy);
    // Zjisti, kolik z těchto uživatelů je stále v segmentu, kolik přešlo zpět (retence/churn)
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const stillIn = users.filter(u => u.aiSegment === segment).length;
    const left = users.length - stillIn;
    // Statistika podle varianty
    const getVariantStats = require('../utils/followupVariantStats');
    const variantStats = await getVariantStats(segment, userIds);
    res.json({
      total: users.length,
      stillIn,
      left,
      percentRetained: users.length ? Math.round((stillIn / users.length) * 100) : 0,
      percentLeft: users.length ? Math.round((left / users.length) * 100) : 0,
      variants: variantStats
    });
  } catch (e) {
    res.status(500).json({ error: 'Chyba při výpočtu efektivity follow-upů' });
  }
});

module.exports = router;
