// Automatizovaný follow-up pro uživatele, kteří neklikli na kampaň do 7 dní
async function sendFollowUps() {
  const Campaign = require('../models/Campaign');
  const User = require('../models/User');
  const { createNotification } = require('../utils/notificationUtils');
  const { auditLog } = require('../middleware/auditLog');
  const now = new Date();
  // Najít kampaně, které byly odeslány před 7-14 dny a nemají follow-up
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const campaigns = await Campaign.find({ status: 'sent', createdAt: { $gte: twoWeeksAgo, $lte: weekAgo }, followUpSent: { $ne: true } }).lean();
  for (const c of campaigns) {
    // Sestavit segment dotaz
    const buildSegmentQuery = require('../utils/segmentQueryBuilder');
    const userQuery = buildSegmentQuery(c.segment || {});
    // Najít uživatele v segmentu, kteří neklikli na tuto kampaň
    const users = await User.find({
      ...userQuery,
      $or: [
        { campaignClicks: { $exists: false } },
        { campaignClicks: { $not: { $elemMatch: { campaign: c.tema } } } }
      ]
    });
    for (const user of users) {
      await createNotification({
        user: user._id,
        type: 'info',
        message: `Připomínka: Zkuste naši kampaň "${c.tema}"! Ještě jste nevyužili možnost.`,
        channel: user.notificationChannel || 'in-app'
      });
    }
    await Campaign.updateOne({ _id: c._id }, { $set: { followUpSent: true } });
    auditLog('Automatizovaný follow-up', null, {
      tema: c.tema,
      userCount: users.length,
      campaignId: c._id,
      timestamp: new Date().toISOString()
    });
  }
}
const notifyAdmin = require('../utils/adminNotifier');
// Automatický plánovač rozesílání kampaní a výběru vítěze
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationUtils');
const { auditLog } = require('../middleware/auditLog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/serviskol';

async function sendCampaign(campaign) {
  // Výběr cílové skupiny podle segmentu (pokročilá segmentace)
  const buildSegmentQuery = require('../utils/segmentQueryBuilder');
  const segment = campaign.segment || {};
  const userQuery = buildSegmentQuery(segment);
  const users = await User.find(userQuery);
  const variants = campaign.variants;
  // AI výběr kanálu pro každého uživatele
  function selectBestChannel(user) {
    // Pokud má uživatel preferovaný kanál a engagement > 0, použij ho
    if (user.preferredChannel && user.channelEngagement && user.channelEngagement[user.preferredChannel.replace('-', '')] > 0) {
      return user.preferredChannel;
    }
    // Jinak vyber kanál s nejvyšším engagementem
    if (user.channelEngagement) {
      const entries = Object.entries(user.channelEngagement);
      const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
      if (best[1] > 0) return best[0] === 'inApp' ? 'in-app' : best[0];
    }
    // Fallback: preferovaný kanál nebo in-app
    return user.preferredChannel || 'in-app';
  }
  // Rozdělení uživatelů na varianty (rovnoměrně)
  const userGroups = Array.from({ length: variants.length }, () => []);
  users.forEach((user, idx) => {
    userGroups[idx % variants.length].push(user);
  });
  // Odeslání notifikací a naplnění sentCount
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const group = userGroups[i];
    for (const user of group) {
      const channel = selectBestChannel(user);
      await createNotification({
        user: user._id,
        type: 'info',
        message: variant.text + (variant.faq ? `\nVíce: ${variant.faq}` : ''),
        channel
      });
      // Zaznamenat engagement (zvýšit sentCount pro kanál)
      if (user.channelEngagement) {
        const key = channel === 'in-app' ? 'inApp' : channel;
        user.channelEngagement[key] = (user.channelEngagement[key] || 0) + 1;
        await user.save();
      }
    }
    variants[i].sentCount = group.length;
  }
  campaign.variants = variants;
  campaign.status = 'sent';
  await campaign.save();
  auditLog('Plánovaná kampaň odeslána', null, {
    tema: campaign.tema,
    segment,
    variants: variants.map(v => ({ label: v.label, sentCount: v.sentCount, faq: v.faq })),
    userCount: users.length,
    scheduledAt: campaign.scheduledAt,
    timestamp: new Date().toISOString()
  });
}

async function selectWinnerAndSend(campaign) {
  // Real-time upozornění na výrazný rozdíl ve výkonu variant
  if (campaign.variants && campaign.variants.length > 1) {
    // Najít CTR všech variant
    const ctrs = campaign.variants.map(v => v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0);
    const maxCTR = Math.max(...ctrs);
    const minCTR = Math.min(...ctrs);
    if (maxCTR - minCTR > 0.2) { // rozdíl > 20 %
      const subject = `ServisKol: Výrazný rozdíl ve výkonu variant kampaně '${campaign.tema}'`;
      const text = `Rozdíl CTR mezi variantami je ${(maxCTR*100).toFixed(1)}% vs ${(minCTR*100).toFixed(1)}%. Doporučujeme zkontrolovat výsledky v admin dashboardu.`;
      try { await notifyAdmin(subject, text); } catch (e) { console.error('Chyba při odesílání upozornění adminovi:', e); }
    }
  }
  // Najít variantu s nejvyšším CTR (clickCount/sentCount)
  let winner = null;
  let maxCTR = -1;
  for (const v of campaign.variants) {
    const ctr = v.sentCount > 0 ? (v.clickCount || 0) / v.sentCount : 0;
    if (ctr > maxCTR) {
      maxCTR = ctr;
      winner = v;
    }
  }
  if (!winner) return;
  // Najít uživatele, kteří ještě nedostali žádnou variantu (např. nově přidaní do segmentu)
  // Pro jednoduchost zde neřešíme, pouze logujeme výběr vítěze
  campaign.winnerVariant = winner.label;
  campaign.status = 'winner_sent';
  await campaign.save();
  auditLog('Vítězná varianta rozpoznána', null, {
    tema: campaign.tema,
    winner: winner.label,
    ctr: maxCTR,
    timestamp: new Date().toISOString()
  });
}

async function main() {
  // Monitoring engagementu podle kanálu (alert při poklesu)
  const User = require('../models/User');
  const { alertAdmins } = require('../utils/notificationUtils');
  const users = await User.find({});
  const now = new Date();
  // Získat engagement za posledních 30 dní a za posledních 7 dní
  const getEngagement = (days) => {
    const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const report = { inApp: 0, email: 0, push: 0, sms: 0 };
    users.forEach(u => {
      if (u.campaignClicks) {
        u.campaignClicks.forEach(cl => {
          if (cl.clickedAt && new Date(cl.clickedAt) >= since && cl.channel) {
            const key = cl.channel === 'in-app' ? 'inApp' : cl.channel;
            report[key] = (report[key] || 0) + 1;
          }
        });
      }
    });
    return report;
  };
  const engagement30 = getEngagement(30);
  const engagement7 = getEngagement(7);
  // Alert pokud některý kanál má pokles >30 % oproti 30dennímu průměru
  Object.keys(engagement30).forEach(channel => {
    const avg = engagement30[channel] / 30;
    const last7 = engagement7[channel] / 7;
    if (avg > 0 && last7 < avg * 0.7) {
      alertAdmins({
        subject: `Pokles engagementu v kanálu ${channel}`,
        text: `Průměr za 30 dní: ${avg.toFixed(2)} / den, posledních 7 dní: ${last7.toFixed(2)} / den. Doporučujeme zkontrolovat kampaně a případně změnit strategii.`
      });
    }
  });
  await mongoose.connect(MONGO_URI);
  // Odeslat naplánované kampaně
  const now = new Date();
  const scheduled = await Campaign.find({ status: 'scheduled', scheduledAt: { $lte: now } });
  for (const c of scheduled) {
    await sendCampaign(c);
  }
  // Automatický výběr vítěze (např. po 1000 odesláních)
  const abCampaigns = await Campaign.find({ autoSelectWinner: true, status: 'sent' });
  for (const c of abCampaigns) {
    const totalSent = c.variants.reduce((sum, v) => sum + (v.sentCount || 0), 0);
    if (totalSent >= 1000 && !c.winnerVariant) {
      await selectWinnerAndSend(c);
    }
  }
  // Automatizované follow-upy
  await sendFollowUps();
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
