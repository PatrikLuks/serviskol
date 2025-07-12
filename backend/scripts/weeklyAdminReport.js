// Cron skript pro týdenní reporting a eskalaci návrhů pro adminy
// Spouštět např. každé pondělí v noci (cron)

const mongoose = require('mongoose');
const AlertLog = require('../models/AlertLog');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const { default: dayjs } = require('dayjs');
require('dotenv').config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/serviskol';
const DAYS = 7;
const ESCALATE_AFTER_DAYS = 7; // Po kolika dnech připomenout nevyřízené návrhy

async function main() {
  await mongoose.connect(MONGO_URI);
  const since = dayjs().subtract(DAYS, 'day').toDate();

  // 1. Souhrn za poslední týden
  const newProposals = await AlertLog.countDocuments({ createdAt: { $gte: since }, approvalStatus: 'pending' });
  const approved = await AlertLog.countDocuments({ approvalStatus: 'approved', approvalAt: { $gte: since } });
  const rejected = await AlertLog.countDocuments({ approvalStatus: 'rejected', approvalAt: { $gte: since } });
  const followupSuccess = await AlertLog.countDocuments({ actionType: 'followup', actionResult: 'success', actionExecutedAt: { $gte: since } });

  // 2. Nevyřízené návrhy (pending)
  const pending = await AlertLog.find({ approvalStatus: 'pending' });

  // 3. Eskalace: návrhy čekající déle než ESCALATE_AFTER_DAYS
  const escalateSince = dayjs().subtract(ESCALATE_AFTER_DAYS, 'day').toDate();
  const toEscalate = await AlertLog.find({ approvalStatus: 'pending', createdAt: { $lte: escalateSince } });

  // 4. Notifikace adminům
  const admins = await User.find({ role: 'admin' });
  const summary = `Týdenní report:\nNové návrhy: ${newProposals}\nSchváleno: ${approved}\nZamítnuto: ${rejected}\nÚspěšné follow-upy: ${followupSuccess}\nNevyřízené návrhy: ${pending.length}`;
  for (const admin of admins) {
    await createNotification({
      user: admin._id,
      type: 'system',
      message: summary,
      channel: 'in-app'
    });
    if (toEscalate.length > 0) {
      await createNotification({
        user: admin._id,
        type: 'system',
        message: `Pozor: ${toEscalate.length} návrhů čeká na schválení déle než ${ESCALATE_AFTER_DAYS} dní!`,
        channel: 'in-app'
      });
    }
  }
  console.log('Týdenní report a eskalace odeslány adminům.');
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
