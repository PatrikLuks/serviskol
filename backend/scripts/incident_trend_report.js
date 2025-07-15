// Skript pro automatizovanou analýzu incidentů a trendů z audit.log a push.log
const fs = require('fs');
const path = require('path');

const AUDIT_LOG = '/tmp/audit.log';
const PUSH_LOG = '/tmp/push.log';

function parseAuditLog() {
  if (!fs.existsSync(AUDIT_LOG)) return [];
  return fs.readFileSync(AUDIT_LOG, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

function parsePushLog() {
  if (!fs.existsSync(PUSH_LOG)) return [];
  return fs.readFileSync(PUSH_LOG, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map(line => {
      // 2025-07-15T12:34:56.789Z PUSH OK email subject
      const m = line.match(/^(\S+) PUSH (OK|FAIL) (\S+) (.+)$/);
      if (!m) return null;
      return { timestamp: m[1], status: m[2], user: m[3], subject: m[4] };
    })
    .filter(Boolean);
}

function analyzeAudit(audit) {
  const today = new Date().toISOString().slice(0, 10);
  const exports = audit.filter(e => e.action && e.action.includes('Export dat'));
  const alerts = audit.filter(e => e.action && e.action.includes('ALERT'));
  const byType = {};
  audit.forEach(e => {
    const type = e.action || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  });
  return { exports, alerts, byType };
}

function analyzePush(push) {
  const fails = push.filter(e => e.status === 'FAIL');
  const oks = push.filter(e => e.status === 'OK');
  const byUser = {};
  push.forEach(e => {
    byUser[e.user] = byUser[e.user] || { ok: 0, fail: 0 };
    if (e.status === 'OK') byUser[e.user].ok++;
    else byUser[e.user].fail++;
  });
  return { fails, oks, byUser };
}

function generateReport() {
  const audit = parseAuditLog();
  const push = parsePushLog();
  const auditStats = analyzeAudit(audit);
  const pushStats = analyzePush(push);

  let report = `# Incident & Trend Report\n\n`;
  report += `## Audit log\n`;
  report += `- Počet exportů dat: ${auditStats.exports.length}\n`;
  report += `- Počet alertů: ${auditStats.alerts.length}\n`;
  report += `- Nejčastější akce: ` + Object.entries(auditStats.byType).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k} (${v})`).join(', ') + '\n';

  report += `\n## Push notifikace\n`;
  report += `- Počet úspěšných: ${pushStats.oks.length}\n`;
  report += `- Počet selhání: ${pushStats.fails.length}\n`;
  if (pushStats.fails.length > 0) {
    report += `- Nejčastější selhání u uživatelů: ` + Object.entries(pushStats.byUser).filter(([u,stat])=>stat.fail>0).map(([u,stat])=>`${u}: ${stat.fail} fail`).join(', ') + '\n';
  }

  // Doporučení
  report += `\n## Doporučení\n`;
  if (auditStats.exports.length > 3) report += `- Zkontrolujte nadměrné exporty dat.\n`;
  if (auditStats.alerts.length > 0) report += `- Projděte alerty v audit logu.\n`;
  if (pushStats.fails.length > 0) report += `- Zkontrolujte selhání push notifikací a FCM klíče.\n`;
  if (Object.values(pushStats.byUser).some(stat=>stat.fail>2)) report += `- Někteří uživatelé mají opakované selhání push – ověřte jejich tokeny.\n`;
  if (auditStats.exports.length === 0 && pushStats.fails.length === 0 && auditStats.alerts.length === 0) report += `- Systém je stabilní, žádné incidenty.\n`;

  return report;
}

if (require.main === module) {
  console.log(generateReport());
}

module.exports = { generateReport };
