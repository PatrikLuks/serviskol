// Skript: ai_security_resilience_audit.js
// Popis: Automatizuje bezpečnostní a resilience audit, vytváří Issues a aktualizuje lessons learned/checklisty.

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

const CHECKLIST_FILES = [
  'SECURITY_AUDIT.md',
  'MONITORING_ALERTING_AUDIT_CHECKLIST.md',
  'MONITORING_BACKUP.md',
];
const LESSONS_LEARNED_FILE = path.join(__dirname, '../backend/onboarding-lessons-learned.md');

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

async function syncChecklists() {
  for (const checklist of CHECKLIST_FILES) {
    const filePath = path.join(__dirname, '..', checklist);
    if (!fs.existsSync(filePath)) continue;
    const items = extractChecklistItems(filePath);
    const labels = checklist.includes('SECURITY') ? ['security'] : ['resilience'];
    const openIssues = await getOpenIssues(labels.join(','));
    for (const item of items) {
      await createIssueIfNotExists(item, openIssues, checklist, labels);
    }
  }
}

async function handleClosedIssues() {
  const closedIssues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    labels: 'security,resilience',
    per_page: 100,
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  for (const issue of closedIssues.data) {
    addToLessonsLearned(issue.title);
  }
}

async function main() {
  await syncChecklists();
  await handleClosedIssues();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
