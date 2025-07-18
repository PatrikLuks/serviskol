// Automatizovaný export compliance reportů a audit logů
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH_MD = path.join(REPORTS_DIR, `ai_compliance_report-latest.md`);
const OUT_PATH_PDF = path.join(REPORTS_DIR, `ai_compliance_report-latest.pdf`);
const AUDIT_LOG_PATH = path.join(REPORTS_DIR, `ai_audit_log-latest.md`);

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith(prefix));
  if (!files.length) return '';
  const latest = files.sort().reverse()[0];
  return fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf-8');
}

async function exportComplianceReport() {
  const compliance = getLatestReport('ai_team_knowledge_base_compliance_report-');
  const audit = fs.existsSync(AUDIT_LOG_PATH) ? fs.readFileSync(AUDIT_LOG_PATH, 'utf-8') : '';
  if (!compliance && !audit) {
    console.error('Chybí podklady pro compliance export.');
    process.exit(1);
  }
  const report = `# Compliance Report\n\n${compliance}\n\n# Audit Log\n\n${audit}`;
  fs.writeFileSync(OUT_PATH_MD, report);
  await new Promise((resolve, reject) => {
    markdownpdf().from(OUT_PATH_MD).to(OUT_PATH_PDF, err => err ? reject(err) : resolve());
  });
  console.log(`Compliance report exportován do PDF: ${OUT_PATH_PDF}`);
}

if (require.main === module) {
  exportComplianceReport();
}
