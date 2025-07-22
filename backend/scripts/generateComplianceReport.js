// Automatizovaný compliance report (GDPR, bezpečnost, auditní stopa)
// Shrnuje stav záloh, incidentů, auditních logů, bezpečnostních testů
// Výstup: reports/compliance_report_YYYY-MM-DD.txt

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const BACKUP_DIR = path.resolve(__dirname, '../backups');
const INCIDENT_LOG = path.resolve(__dirname, '../reports/incident.log');
const AUDIT_LOG = path.resolve(__dirname, '../logs/audit.log');
const SECURITY_REPORT = path.resolve(__dirname, '../reports/ai_security_analysis.md');
const PENTEST_REPORT = path.resolve(__dirname, '../reports/ai_pentest_analysis.md');
const OUT_PATH = path.resolve(__dirname, `../reports/compliance_report_${dayjs().format('YYYY-MM-DD')}.txt`);

function summarizeBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return 'Žádné zálohy nenalezeny.';
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.gz') || f.endsWith('.zip'));
  if (files.length === 0) return 'Žádné zálohy nenalezeny.';
  const latest = files.map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtime })).sort((a, b) => b.t - a.t)[0];
  return `Počet záloh: ${files.length}\nPoslední záloha: ${latest.f} (${latest.t.toISOString()})`;
}

function summarizeFile(p, label) {
  if (!fs.existsSync(p)) return `${label}: soubor nenalezen.`;
  const lines = fs.readFileSync(p, 'utf8').split('\n').filter(Boolean);
  return `${label}:\nPosledních 5 záznamů:\n` + lines.slice(-5).join('\n');
}

function summarizeMarkdown(p, label) {
  if (!fs.existsSync(p)) return `${label}: soubor nenalezen.`;
  const content = fs.readFileSync(p, 'utf8');
  return `${label}:\n${content.substring(0, 800)}${content.length > 800 ? '\n... (zkráceno)' : ''}`;
}

function main() {
  let report = `=== COMPLIANCE REPORT (${dayjs().format('YYYY-MM-DD')}) ===\n\n`;
  report += '--- Zálohy ---\n' + summarizeBackups() + '\n\n';
  report += '--- Incidenty ---\n' + summarizeFile(INCIDENT_LOG, 'Incident log') + '\n\n';
  report += '--- Auditní logy ---\n' + summarizeFile(AUDIT_LOG, 'Audit log') + '\n\n';
  report += '--- AI bezpečnostní analýza ---\n' + summarizeMarkdown(SECURITY_REPORT, 'AI security analysis') + '\n\n';
  report += '--- AI analýza pentestu ---\n' + summarizeMarkdown(PENTEST_REPORT, 'AI pentest analysis') + '\n\n';
  fs.writeFileSync(OUT_PATH, report);
  console.log('Compliance report vygenerován:', OUT_PATH);
}

if (require.main === module) {
  main();
}
