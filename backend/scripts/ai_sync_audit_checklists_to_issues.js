// Skript: ai_sync_audit_checklists_to_issues.js
// Popis: Najde nevyřešená doporučení v auditních checklist souborech a synchronizuje je s GitHub Issues.
// Po uzavření Issue automaticky přidá bod do lessons learned/checklistu.

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

// Nastavení
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

// Soubory s checklisty (lze rozšířit)
const CHECKLIST_FILES = [
  'SECURITY_AUDIT.md',
  'MONITORING_ALERTING_AUDIT_CHECKLIST.md',
  'PERFORMANCE_ASSET_AUDIT_CHECKLIST.md',
  'LOAD_TEST_CHECKLIST.md',
  'ONBOARDING_CHECKLIST.md',
  'COMMUNITY_GROWTH_CHECKLIST.md',
  'MARKETING_CHECKLIST.md',
];

// Lessons learned soubor
const LESSONS_LEARNED_FILE = 'onboarding-lessons-learned.md';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getOpenIssues() {
  const issues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    labels: 'audit',
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

async function createIssueIfNotExists(item, openIssues, checklistFile) {
  const exists = openIssues.some(issue => issue.title === item);
  if (!exists) {
    await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: item,
      body: `Doporučení z checklistu: **${checklistFile}**\n\nProsím o vyřešení a po uzavření aktualizujte lessons learned.`,
      labels: ['audit'],
    });
    console.log(`Vytvořeno Issue: ${item}`);
  }
}

function addToLessonsLearned(item) {
  const filePath = path.join(__dirname, '..', 'backend', LESSONS_LEARNED_FILE);
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  if (!content.includes(item)) {
    content += `\n- ${item}`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Přidáno do lessons learned: ${item}`);
  }
}

async function syncChecklists() {
  const openIssues = await getOpenIssues();
  for (const checklist of CHECKLIST_FILES) {
    const filePath = path.join(__dirname, '..', checklist);
    if (!fs.existsSync(filePath)) continue;
    const items = extractChecklistItems(filePath);
    for (const item of items) {
      await createIssueIfNotExists(item, openIssues, checklist);
    }
  }
}

// Automatická aktualizace lessons learned při uzavření Issue
async function handleClosedIssues() {
  const closedIssues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    labels: 'audit',
    per_page: 100,
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // posledních 7 dní
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
