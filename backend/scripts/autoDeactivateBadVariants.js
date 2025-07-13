const mongoose = require('mongoose');
const FollowupAutomation = require('../models/FollowupAutomation');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const axios = require('axios');

async function autoDeactivateBadVariants() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/serviskol');
  const automations = await FollowupAutomation.find({ active: true });
  for (const a of automations) {
    if (!a.variants || a.variants.length < 2) continue;
    try {
      const res = await axios.get('http://localhost:3000/api/bi/followup-effectiveness', {
        params: { segment: a.triggerSegment }
      });
      const variants = res.data.variants;
      if (!variants) continue;
      const entries = Object.entries(variants);
      const avgRet = entries.reduce((sum, v) => sum + v[1].percentRetained, 0) / entries.length;
      for (const [label, stats] of entries) {
        if (stats.percentRetained < avgRet - 30 && stats.count > 20) {
          // Najdi variantu v DB a deaktivuj
          const v = a.variants.find(v => v.label === label && v.active);
          if (v) {
            v.active = false;
            await a.save();
            await AuditLog.create({
              action: 'auto_deactivate_variant',
              performedBy: null,
              details: { automationId: a._id, label, percentRetained: stats.percentRetained, avgRet },
              createdAt: new Date()
            });
            await Notification.create({
              user: null,
              type: 'bi_alert',
              message: `Varianta "${label}" byla automaticky deaktivována (retence ${stats.percentRetained} %, průměr ${avgRet.toFixed(1)} %).`,
              createdAt: new Date()
            });
            console.log(`AUTO-DEACTIVATED: ${label} (retence ${stats.percentRetained} %, průměr ${avgRet.toFixed(1)} %)`);
          }
        }
      }
    } catch (e) {
      console.error('Chyba při auto-deaktivaci variant:', e.message);
    }
  }
  mongoose.disconnect();
}

if (require.main === module) autoDeactivateBadVariants();

module.exports = autoDeactivateBadVariants;
