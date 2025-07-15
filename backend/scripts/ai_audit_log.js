// AI Audit Log: Centrální auditní log všech AI zásahů a doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_audit_log-${new Date().toISOString().slice(0,10)}.md`);

function getAllReports() {
  return fs.readdirSync(REPORTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: path.join(REPORTS_DIR, f),
      mtime: fs.statSync(path.join(REPORTS_DIR, f)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
}

function extractSummary(reportText, filename) {
  // Vytáhne první nadpis a několik prvních řádků
  const lines = reportText.split('\n');
  const title = lines.find(l => l.startsWith('#')) || filename;
  const summary = lines.slice(1, 8).join(' ');
  return { title, summary };
}

function getLinksForReport(filename) {
  // Odkazy na Issues, PR, apod. podle typu reportu
  if (filename.startsWith('ai_code_review')) return 'Typ: AI Code Review (viz PR na GitHubu)';
  if (filename.startsWith('ai_product_roadmap_advisor')) return 'Typ: AI Roadmap Advisor';
  if (filename.startsWith('ai_risk_predictor')) return 'Typ: AI Risk Predictor';
  if (filename.startsWith('voice_of_customer')) return 'Typ: Voice of Customer';
  if (filename.startsWith('incident_trend_report')) return 'Typ: Incident Trend Report';
  if (filename.startsWith('retrospective_report')) return 'Typ: Retrospective';
  if (filename.startsWith('onboarding-lessons-learned')) return 'Typ: Onboarding Lessons';
  if (filename.startsWith('product_analytics')) return 'Typ: Product Analytics';
  return 'Typ: Ostatní';
}

function formatLogEntry(report, summary) {
  return `### ${summary.title}\n- Soubor: ${report.name}\n- Čas: ${report.mtime.toISOString()}\n- ${getLinksForReport(report.name)}\n- Shrnutí: ${summary.summary}\n`;
}

function generateAuditLog() {
  const reports = getAllReports();
  let md = `# AI Audit Log\n\nAutomaticky generovaný přehled všech AI-driven zásahů, doporučení a reportů.\n\n`;
  for (const report of reports) {
    const text = fs.readFileSync(report.path, 'utf-8');
    const summary = extractSummary(text, report.name);
    md += formatLogEntry(report, summary) + '\n';
  }
  return md;
}

function main() {
  const log = generateAuditLog();
  fs.writeFileSync(OUT_PATH, log);
  console.log(`AI Audit Log uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
