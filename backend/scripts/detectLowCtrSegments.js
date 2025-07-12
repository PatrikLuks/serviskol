// Skript pro detekci segmentů s nízkým CTR a generování alertů
// Spouštět pravidelně (např. cronem)


const mongoose = require('mongoose');
const AlertLog = require('../models/AlertLog');
const User = require('../models/User');
const { default: dayjs } = require('dayjs');
const { generateFollowupMessage, generateFollowupSummary } = require('../utils/openai');
require('dotenv').config({ path: '../../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/serviskol';
const CTR_THRESHOLD = 0.2; // 20 %
const DAYS = 14;

async function main() {
  await mongoose.connect(MONGO_URI);
  const { createNotification } = require('../utils/notificationUtils');
  const since = dayjs().subtract(DAYS, 'day').toDate();

  // Najdi všechny follow-up alerty za posledních 14 dní
  const logs = await AlertLog.find({
    campaignId: { $exists: true },
    createdAt: { $gte: since }
  }).lean();

  // Seskup podle segmentu
  const segmentMap = {};
  for (const log of logs) {
    const seg = log.segment || {};
    const key = [seg.role || '', seg.region || '', seg.ageGroup || ''].join('-');
    if (!segmentMap[key]) segmentMap[key] = { logs: [], ctrSum: 0, count: 0, segment: seg };
    if (typeof log.ctr === 'number') {
      segmentMap[key].ctrSum += log.ctr;
      segmentMap[key].count++;
    }
    segmentMap[key].logs.push(log);
  }

  // Pro každý segment spočítej průměrné CTR
  for (const key in segmentMap) {
    const { ctrSum, count, segment } = segmentMap[key];
    if (count === 0) continue;
    const avgCtr = ctrSum / count;
    if (avgCtr < CTR_THRESHOLD) {
      // Zkontroluj, zda už existuje aktivní alert pro tento segment
      const existing = await AlertLog.findOne({
        type: 'low-ctr-segment',
        'segment.role': segment.role || null,
        'segment.region': segment.region || null,
        'segment.ageGroup': segment.ageGroup || null,
        createdAt: { $gte: since }
      });
      if (!existing) {
        // --- Automaticky vygenerovat návrh follow-up akce s AI textem ---
        let aiMessage = '';
        let aiSummary = '';
        try {
          aiMessage = await generateFollowupMessage({ segment, ctr: avgCtr, days: DAYS });
          aiSummary = await generateFollowupSummary({ segment, ctr: avgCtr, days: DAYS });
        } catch (e) {
          aiMessage = 'Dobrý den, rádi bychom vás znovu oslovili. Pokud jste naši poslední zprávu přehlédli, zkuste ji prosím otevřít – čeká na vás důležitá informace!';
          aiSummary = 'Follow-up je doporučen kvůli nízkému CTR v tomto segmentu. Očekávané zvýšení CTR: 5-15 %.';
        }
        const proposedAction = {
          type: 'followup',
          message: aiMessage,
          aiSuggestion: true,
          channel: null, // může být doplněno predikcí
          aiSummary
        };
        // AI auto-approval: pokud aiSummary je pozitivní a podobný návrh byl v minulosti schválen, schválit automaticky
        let autoApproved = false;
        let approvalStatus = 'pending';
        let audit = [{ event: 'auto-detect-low-ctr', at: new Date() }];
        // Heuristika: pokud aiSummary obsahuje "očekávané zvýšení" nebo "doporučeno" a v posledních 90 dnech byl schválen followup pro stejný segment
        const similarApproved = await AlertLog.findOne({
          'segment.role': segment.role || null,
          'segment.region': segment.region || null,
          'segment.ageGroup': segment.ageGroup || null,
          approvalStatus: 'approved',
          'proposedAction.type': 'followup',
          createdAt: { $gte: dayjs().subtract(90, 'day').toDate() }
        });
        if ((aiSummary && /zvýšení|doporučen/i.test(aiSummary)) && similarApproved) {
          approvalStatus = 'auto';
          autoApproved = true;
          audit.push({ event: 'ai-auto-approved', at: new Date(), reason: 'AI summary pozitivní a podobný návrh byl schválen' });
        }
        const newAlert = await AlertLog.create({
          type: 'low-ctr-segment',
          message: `Segment s nízkým CTR (${(avgCtr*100).toFixed(1)}%) za posledních ${DAYS} dní`,
          segment,
          value: avgCtr,
          period: `${DAYS}d`,
          createdAt: new Date(),
          action: 'Doporučujeme follow-up nebo změnu kanálu',
          actionType: 'recommendation',
          proposedAction,
          approvalStatus,
          audit
        });
        if (autoApproved) {
          // Provést akci (např. naplánovat followup kampaň, zde pouze auditujeme)
          newAlert.audit.push({ event: 'auto-action-executed', at: new Date() });
          await newAlert.save();
        } else {
          // Notifikace všem adminům o novém návrhu ke schválení
          const admins = await User.find({ role: 'admin' });
          for (const admin of admins) {
            await createNotification({
              user: admin._id,
              type: 'system',
              message: `Nový návrh akce ke schválení: segment ${Object.entries(segment).map(([k,v])=>`${k}: ${v}`).join(', ')} (nízké CTR ${(avgCtr*100).toFixed(1)}%)`,
              channel: 'in-app'
            });
          }
        }
        console.log(`ALERT: Nízké CTR pro segment ${key}: ${(avgCtr*100).toFixed(1)}% (návrh follow-up)`);
      }
    }
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
