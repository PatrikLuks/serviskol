// Skript: ai_audit_trend_report.js
// Popis: Generuje trendový report o plnění doporučení z auditních checklistů, včetně statistik a eskalace kritických úkolů.

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

const CHECKLIST_FILES = [
  'SECURITY_AUDIT.md',
  'MONITORING_ALERTING_AUDIT_CHECKLIST.md',
  'PERFORMANCE_ASSET_AUDIT_CHECKLIST.md',
  'LOAD_TEST_CHECKLIST.md',
  'ONBOARDING_CHECKLIST.md',
  'COMMUNITY_GROWTH_CHECKLIST.md',
  'MARKETING_CHECKLIST.md',
];

const REPORT_FILE = path.join(__dirname, '../reports/audit_trend_report.md');

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function extractChecklistStats(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let total = 0, done = 0, open = 0;
  for (const line of lines) {
    if (/^- \[.\] /.test(line)) total++;
    if (/^- \[x\] /.i.test(line)) done++;
    if (/^- \[ \] /.test(line)) open++;
  }
  return { total, done, open };
}

async function getOpenAuditIssues() {
  const issues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    labels: 'audit',
    per_page: 100,
  });
  return issues.data;
}

function generateReport(stats, openIssues) {
  let total = 0, done = 0, open = 0;
  let report = `# Audit Trend Report\n\nDatum: ${new Date().toISOString().slice(0,10)}\n\n`;
  report += '| Checklist | Splněno | Otevřeno | Celkem |\n|---|---|---|---|\n';
  for (const [file, s] of Object.entries(stats)) {
    report += `| ${file} | ${s.done} | ${s.open} | ${s.total} |\n`;
    total += s.total; done += s.done; open += s.open;
  }
  report += `| **Celkem** | **${done}** | **${open}** | **${total}** |\n\n`;
  report += `## Otevřené auditní Issues (${openIssues.length})\n`;
  for (const issue of openIssues) {
    report += `- [ ] [${issue.title}](${issue.html_url})\n`;
  }
  if (openIssues.length > 0) {
    report += '\n**Eskalace:** Kritické nesplněné úkoly je nutné prioritně řešit!\n';
  } else {
    report += '\nVšechna doporučení jsou splněna. Skvělá práce!\n';
  }
  return report;
}

async function main() {
  const stats = {};
  for (const checklist of CHECKLIST_FILES) {
    const filePath = path.join(__dirname, '..', checklist);
    if (!fs.existsSync(filePath)) continue;
    stats[checklist] = extractChecklistStats(filePath);
  }
  const openIssues = await getOpenAuditIssues();
  const report = generateReport(stats, openIssues);
  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.log('Audit trend report vygenerován:', REPORT_FILE);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
