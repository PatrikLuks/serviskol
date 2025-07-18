// Skript: ai_marketing_community_audit.js
// Popis: Automatizuje audit marketingových a komunitních aktivit, vytváří Issues, aktualizuje checklisty a generuje měsíční souhrn.

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

const CHECKLIST_FILES = [
  'MARKETING_CHECKLIST.md',
  'COMMUNITY_GROWTH_CHECKLIST.md',
];
const LESSONS_LEARNED_FILE = path.join(__dirname, '../backend/onboarding-lessons-learned.md');
const MONTHLY_REPORT_FILE = path.join(__dirname, '../reports/marketing_community_summary-' + new Date().toISOString().slice(0,7) + '.md');

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getOpenIssues(labels) {
  const issues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    labels,
    per_page: 100,
  });
  return issues.data;
}

function extractChecklistItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const items = [];
  for (const line of lines) {
    const match = line.match(/^- \[ \] (.+)$/);
    if (match) {
      items.push(match[1].trim());
    }
  }
  return items;
}

async function createIssueIfNotExists(item, openIssues, checklistFile, labels) {
  const exists = openIssues.some(issue => issue.title === item);
  if (!exists) {
    await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: item,
      body: `Doporučení z checklistu: **${checklistFile}**\n\nProsím o vyřešení a po uzavření aktualizujte lessons learned.`,
      labels,
    });
    console.log(`Vytvořeno Issue: ${item}`);
  }
}

function addToLessonsLearned(item) {
  let content = '';
  if (fs.existsSync(LESSONS_LEARNED_FILE)) {
    content = fs.readFileSync(LESSONS_LEARNED_FILE, 'utf8');
  }
  if (!content.includes(item)) {
    content += `\n- ${item}`;
    fs.writeFileSync(LESSONS_LEARNED_FILE, content, 'utf8');
    console.log(`Přidáno do lessons learned: ${item}`);
  }
}

function generateMonthlyReport(openItems, closedItems) {
  let report = `# Marketing & Community – Souhrn aktivit\n\nMěsíc: ${new Date().toISOString().slice(0,7)}\n\n`;
  report += '## Otevřené body\n';
  for (const item of openItems) {
    report += `- [ ] ${item}\n`;
  }
  report += '\n## Uzavřené body tento měsíc\n';
  for (const item of closedItems) {
    report += `- [x] ${item}\n`;
  }
  return report;
}

async function syncChecklists() {
  let openItems = [], closedItems = [];
  for (const checklist of CHECKLIST_FILES) {
    const filePath = path.join(__dirname, '..', checklist);
    if (!fs.existsSync(filePath)) continue;
    const items = extractChecklistItems(filePath);
    const labels = checklist.includes('MARKETING') ? ['marketing'] : ['community'];
    const openIssues = await getOpenIssues(labels.join(','));
    for (const item of items) {
      await createIssueIfNotExists(item, openIssues, checklist, labels);
      openItems.push(item);
    }
  }
  // Uzavřené Issues za poslední měsíc
  const closedIssues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    labels: 'marketing,community',
    per_page: 100,
    since: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
  });
  for (const issue of closedIssues.data) {
    addToLessonsLearned(issue.title);
    closedItems.push(issue.title);
  }
  // Vygeneruj měsíční report
  const report = generateMonthlyReport(openItems, closedItems);
  fs.writeFileSync(MONTHLY_REPORT_FILE, report, 'utf8');
  console.log('Marketing & Community report vygenerován:', MONTHLY_REPORT_FILE);
}

async function main() {
  await syncChecklists();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
