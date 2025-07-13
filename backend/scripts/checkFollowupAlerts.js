const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const FollowupAutomation = require('../models/FollowupAutomation');
const axios = require('axios');
const Notification = require('../models/Notification');

async function checkFollowupAlerts() {
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
      // Najdi nejhorší variantu podle retence
      const entries = Object.entries(variants);
      const worst = entries.reduce((a, b) => (b[1].percentRetained < a[1].percentRetained ? b : a), entries[0]);
      // Pokud je retence nejhorší varianty o 30+ procentních bodů nižší než nejlepší, vytvoř alert
      const best = entries.reduce((a, b) => (b[1].percentRetained > a[1].percentRetained ? b : a), entries[0]);
      if (best[1].percentRetained - worst[1].percentRetained >= 30) {
        await Notification.create({
          user: null,
          type: 'bi_alert',
          message: `Varianta "${worst[0]}" má výrazně nižší retenci (${worst[1].percentRetained} %) než nejlepší varianta "${best[0]}" (${best[1].percentRetained} %). Doporučujeme zvážit její úpravu nebo deaktivaci.`,
          createdAt: new Date()
        });
        await AuditLog.create({
          action: 'bi_alert_followup_variant',
          performedBy: null,
          details: { automationId: a._id, worst: worst[0], best: best[0], diff: best[1].percentRetained - worst[1].percentRetained },
          createdAt: new Date()
        });
        console.log(`ALERT: Varianta ${worst[0]} má výrazně nižší retenci než ${best[0]}`);
      }
    } catch (e) {
      console.error('Chyba při vyhodnocení alertů:', e.message);
    }
  }
  mongoose.disconnect();
}

if (require.main === module) checkFollowupAlerts();

module.exports = checkFollowupAlerts;
