// Automatizovaný audit změn práv a pokusů o neoprávněný přístup
require('dotenv').config();
const { sendSlackNotification } = require('../utils/slackNotifier');
const AuditLog = require('../models/AuditLog');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '../reports/audit_rights_and_incidents-latest.md');

async function main() {
  // Získání posledních 30 dní z audit logu
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rightsChanges = await AuditLog.find({ type: 'user-rights-change', createdAt: { $gte: since } }).lean();
  const unauthorized = await AuditLog.find({ type: 'unauthorized', createdAt: { $gte: since } }).lean();

  let report = `# Audit změn práv a incidentů (posledních 30 dní)\n\n`;
  report += `## Změny práv\nPočet: ${rightsChanges.length}\n`;
  rightsChanges.forEach(e => {
    report += `- ${e.createdAt.toISOString()} – ${e.user?.email || ''} – ${e.action || ''}\n`;
  });
  report += `\n## Pokusy o neoprávněný přístup\nPočet: ${unauthorized.length}\n`;
  unauthorized.forEach(e => {
    report += `- ${e.createdAt.toISOString()} – ${e.user?.email || ''} – ${e.action || ''}\n`;
  });

  fs.writeFileSync(OUT_PATH, report);
  console.log(`Audit report uložen do ${OUT_PATH}`);

  // Eskalace při anomálii
  if (rightsChanges.length > 10 || unauthorized.length > 5) {
    await sendSlackNotification({
      text: `Anomálie v auditu: Změny práv (${rightsChanges.length}), neoprávněné pokusy (${unauthorized.length})!`,
      channel: process.env.SLACK_CRITICAL_CHANNEL || '#alerts'
    });
    console.log('Eskalace: Slack alert odeslán.');
  }
}

if (require.main === module) {
  main();
}
