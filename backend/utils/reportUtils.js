const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// Spustit jako cron (např. každý týden)
async function sendWeeklyReport() {
  // Najdi adminy
  const admins = await User.find({ role: 'admin' });
  // Načti audit logy za posledních 7 dní
  const logPath = path.join(__dirname, '../logs/audit.log');
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const logs = lines.map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean)
    .filter(l => new Date(l.timestamp) >= weekAgo);
  // Statistika
  const actions = {};
  logs.forEach(l => { actions[l.action] = (actions[l.action] || 0) + 1; });
  // Sestav report
  let report = `Týdenní report ServisKol\n\nPočet akcí: ${logs.length}\n`;
  report += 'Nejčastější akce:\n';
  Object.entries(actions).forEach(([a, c]) => { report += `- ${a}: ${c}\n`; });
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
