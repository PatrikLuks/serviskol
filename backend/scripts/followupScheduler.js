// Automatický job pro odesílání naplánovaných follow-up kampaní
const mongoose = require('mongoose');
const AlertLog = require('../models/AlertLog');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/serviskol';

async function processScheduledFollowups() {
  await mongoose.connect(MONGO_URI);
  const now = new Date();
  // Najít všechny naplánované follow-upy, které mají být odeslány
  const logs = await AlertLog.find({
    actionType: 'followup',
    actionResult: 'scheduled',
    scheduledAt: { $lte: now }
  });
  for (const log of logs) {
    try {
      const seg = log.segment || {};
      const message = log.followupMessage || 'Děkujeme za zpětnou vazbu, rádi bychom vás znovu oslovili.';
      const query = {};
      if (seg.role) query.role = seg.role;
      if (seg.region) query.region = seg.region;
      if (seg.ageGroup) {
        const [ageMin, ageMax] = seg.ageGroup.split('-').map(Number);
        query.age = { $gte: ageMin, $lte: ageMax };
      }
      const users = await User.find(query);
      const campaign = new Campaign({
        tema: `Follow-up: ${log.message}`,
        segment: seg,
        variants: [{ label: 'A', text: message, channel: log.channel, sentCount: 0, clickCount: 0 }],
        type: 'auto',
        launchedBy: 'alert-followup',
        scheduledAt: now
      });
      await campaign.save();
      log.actionResult = 'success';
      log.actionAffected = users.length;
      log.actionExecutedAt = now;
      await log.save();
      console.log(`Odeslán follow-up alertLog ${log._id} segmentu (${users.length} uživatelů)`);
    } catch (e) {
      log.actionResult = 'error';
      await log.save();
      console.error(`Chyba při odesílání follow-up alertLog ${log._id}:`, e);
    }
  }
  await mongoose.disconnect();
}

if (require.main === module) {
  processScheduledFollowups().then(() => process.exit(0));
}
