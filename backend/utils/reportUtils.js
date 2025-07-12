const AlertLog = require('../models/AlertLog');
const AlertSetting = require('../models/AlertSetting');
// Pomocná funkce pro výpočet průměrného CTR za poslední měsíc
async function getMonthlyCtrStats() {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const campaigns = await Campaign.find({ createdAt: { $gte: monthAgo } });
  const stats = { 'in-app': { sent: 0, clicks: 0 }, email: { sent: 0, clicks: 0 }, push: { sent: 0, clicks: 0 }, sms: { sent: 0, clicks: 0 } };
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      const ch = v.channel;
      if (ch && stats[ch]) {
        stats[ch].sent += v.sentCount || 0;
        stats[ch].clicks += v.clickCount || 0;
      }
    });
  });
  const ctrs = {};
  Object.entries(stats).forEach(([ch, s]) => {
    ctrs[ch] = s.sent > 0 ? (s.clicks / s.sent) * 100 : 0;
  });
  return ctrs;
}

const Campaign = require('../models/Campaign');

// Pomocná funkce pro výpočet průměrného CTR za poslední týden
async function getWeeklyCtrStats() {
  // Získat všechny kampaně za posledních 7 dní
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const campaigns = await Campaign.find({ createdAt: { $gte: weekAgo } });
  // Agregace podle kanálu
  const stats = { 'in-app': { sent: 0, clicks: 0 }, email: { sent: 0, clicks: 0 }, push: { sent: 0, clicks: 0 }, sms: { sent: 0, clicks: 0 } };
  campaigns.forEach(c => {
    (c.variants || []).forEach(v => {
      const ch = v.channel;
      if (ch && stats[ch]) {
        stats[ch].sent += v.sentCount || 0;
        stats[ch].clicks += v.clickCount || 0;
      }
    });
  });
  // Výpočet CTR
  const ctrs = {};
  Object.entries(stats).forEach(([ch, s]) => {
    ctrs[ch] = s.sent > 0 ? (s.clicks / s.sent) * 100 : 0;
  });
  return ctrs;
}

module.exports.getWeeklyCtrStats = getWeeklyCtrStats;
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Spustit jako cron (např. každý týden)
async function sendWeeklyReport() {
  // --- Personalizované alerty podle AlertSetting ---
  const monthlyCtrs = await getMonthlyCtrStats();
  for (const admin of admins) {
    const alertSettings = await AlertSetting.find({ admin: admin._id });
    const adminAlerts = [];
    for (const setting of alertSettings) {
      if (setting.type === 'ctr') {
        // Pro každý kanál nebo all
        const channels = setting.channel === 'all' ? Object.keys(ctrs) : [setting.channel];
        channels.forEach(ch => {
          const weekVal = ctrs[ch] || 0;
          const monthVal = monthlyCtrs[ch] || 0;
          if (monthVal > 0 && weekVal < monthVal * (1 - setting.threshold / 100)) {
            adminAlerts.push(`Kanál ${ch}: pokles CTR o více než ${setting.threshold}% (týden: ${weekVal.toFixed(1)} %, měsíc: ${monthVal.toFixed(1)} %)`);
          }
        });
      }
      // Další typy alertů (engagement, churn) lze doplnit zde
    }
    if (adminAlerts.length > 0) {
      await sendEmail({
        to: admin.email,
        subject: 'ALERT: Výrazný pokles metrik',
        text: 'Byly detekovány následující alerty za poslední týden:\n' + adminAlerts.join('\n')
      });
      // Zalogovat alerty do AlertLog
      for (const msg of adminAlerts) {
        // Generování doporučené akce na základě alertu
        let action = '';
        let actionType = 'channel';
        const ch = msg.match(/Kanál ([^:]+)/)?.[1] || 'all';
        if (msg.includes('pokles CTR')) {
          action = `Navrhnout změnu preferovaného kanálu na ${ch} pro segment s poklesem CTR.`;
          // Navrhnout i follow-up akci
          await AlertLog.create({
            admin: admin._id,
            type: 'ctr',
            channel: ch,
            threshold: alertSettings.find(s => msg.includes(`${s.threshold}%`))?.threshold,
            value: parseFloat(msg.match(/týden: ([\d\.]+)/)?.[1] || '0'),
            period: 'week',
            message: `Navržen follow-up pro kanál ${ch} kvůli poklesu CTR`,
            action: `Odeslat follow-up kampaň segmentu přes kanál ${ch}.`,
            actionType: 'followup',
            segment
          });
        }
        // Segmentace: pro demo použijeme např. role: 'client', region: 'Praha', ageGroup: '30-39'
        const segment = { role: 'client', region: 'Praha', ageGroup: '30-39' };
        await AlertLog.create({
          admin: admin._id,
          type: 'ctr',
          channel: ch,
          threshold: alertSettings.find(s => msg.includes(`${s.threshold}%`))?.threshold,
          value: parseFloat(msg.match(/týden: ([\d\.]+)/)?.[1] || '0'),
          period: 'week',
          message: msg,
          action,
          segment
        });
      }
    }
  }
  // Najdi adminy
  const admins = await User.find({ role: 'admin' });
  // Načti audit logy za posledních 7 dní
  const logPath = '/tmp/audit.log';
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const logs = lines.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean)
    .filter(l => new Date(l.timestamp) >= weekAgo);
  // Statistika
  const actions = {};
  logs.forEach(l => { actions[l.action] = (actions[l.action] || 0) + 1; });
  // CTR statistika
  const ctrs = await module.exports.getWeeklyCtrStats();
  // Sestav report
  let report = `Týdenní report ServisKol\n\nPočet akcí: ${logs.length}\n`;
  report += 'Nejčastější akce:\n';
  Object.entries(actions).forEach(([a, c]) => { report += `- ${a}: ${c}\n`; });
  report += '\nPrůměrné CTR za poslední týden podle kanálu:\n';
  Object.entries(ctrs).forEach(([ch, val]) => { report += `- ${ch}: ${val.toFixed(1)}%\n`; });
  // Alert: více než 5 neúspěšných přihlášení za týden
  const failedLogins = logs.filter(l => l.action === 'Neúspěšné přihlášení').length;
  if (failedLogins > 5) {
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: 'ALERT: Zvýšený počet neúspěšných přihlášení',
        text: `Za poslední týden bylo zaznamenáno ${failedLogins} neúspěšných pokusů o přihlášení.`
      });
    }
  }
  // Odeslat všem adminům
  for (const admin of admins) {
    await sendEmail({
      to: admin.email,
      subject: 'Týdenní report ServisKol',
      text: report
    });
  }
}

module.exports = { sendWeeklyReport };
