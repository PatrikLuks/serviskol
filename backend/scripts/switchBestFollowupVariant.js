// Automatizované přepínání na nejlepší variantu follow-upu podle retence
const mongoose = require('mongoose');
const FollowupAutomation = require('../models/FollowupAutomation');
const axios = require('axios');
const AuditLog = require('../models/AuditLog');

async function switchBestVariant() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/serviskol');
  const automations = await FollowupAutomation.find({ active: true });
  for (const a of automations) {
    if (!a.variants || a.variants.length < 2) continue;
    // Získat efektivitu variant z BI endpointu
    try {
      const res = await axios.get('http://localhost:3000/api/bi/followup-effectiveness', {
        params: { segment: a.triggerSegment }
      });
      const variants = res.data.variants;
      if (!variants) continue;
      // Najít nejlepší variantu podle retence
      const best = Object.entries(variants).reduce((acc, [k, v]) => v.percentRetained > acc[1].percentRetained ? [k, v] : acc, Object.entries(variants)[0]);
      const idx = a.variants.findIndex(v => v.label === best[0]);
      if (idx > 0) {
        // Přesunout nejlepší variantu na začátek
        const [variant] = a.variants.splice(idx, 1);
        a.variants.unshift(variant);
        await a.save();
        await AuditLog.create({
          action: 'auto_switch_best_variant',
          performedBy: null,
          details: { automationId: a._id, bestVariant: best[0], percentRetained: best[1].percentRetained },
          createdAt: new Date()
        });
        console.log(`Automatizace ${a._id}: nastavena nejlepší varianta ${best[0]}`);
      }
    } catch (e) {
      console.error('Chyba při vyhodnocení variant:', e.message);
    }
  }
  mongoose.disconnect();
}

if (require.main === module) switchBestVariant();

module.exports = switchBestVariant;
