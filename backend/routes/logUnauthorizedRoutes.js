const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const SecurityAlert = require('../models/SecurityAlert');
const { sendSlackNotification } = require('../utils/slackNotifier');
const { setLastEscalation } = require('../utils/escalationState');

// POST /api/admin/log-unauthorized
router.post('/log-unauthorized', async (req, res) => {
  const { user, action, section, timestamp } = req.body;
  await AuditLog.create({
    action: 'Neoprávněný přístup',
    performedBy: user?._id || null,
    details: { user, action, section, timestamp },
    createdAt: timestamp ? new Date(timestamp) : new Date()
  });
  await SecurityAlert.create({
    type: 'unauthorized-access',
    message: `Neoprávněný pokus o přístup: ${user?.email || 'neznámý'} – ${action} (${section})`,
    user: user?._id || null,
    details: { user, action, section, timestamp },
    createdAt: timestamp ? new Date(timestamp) : new Date()
  });

    // Zjisti počet pokusů za poslední hodinu od stejného uživatele
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await AuditLog.countDocuments({
      type: 'unauthorized',
      'user.email': user?.email,
      timestamp: { $gte: since }
    });
    if (count >= 3) {
      const escalation = {
        user: user?.email || 'neznámý uživatel',
        count,
        action,
        section,
        type: 'unauthorized',
      };
      await sendSlackNotification({
        text: `🚨 Opakovaný pokus o neoprávněný přístup: ${escalation.user} (${count}x za poslední hodinu) – akce: ${action}, sekce: ${section}`
      });
      setLastEscalation(escalation);
    }
// Endpoint pro získání poslední eskalace
router.get('/last-escalation', (req, res) => {
  const { getLastEscalation } = require('../utils/escalationState');
  res.json(getLastEscalation() || {});
});
  res.json({ ok: true });
});

module.exports = router;
