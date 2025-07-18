// Skript: ai_onboarding_lessons_learned_update.js
// Popis: Aktualizuje lessons learned a onboarding checklisty na základě uzavřených Issues a navrhuje micro-workshop/tip pro tým.

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

const LESSONS_LEARNED_FILE = path.join(__dirname, '../backend/onboarding-lessons-learned.md');
const ONBOARDING_CHECKLISTS = [
  path.join(__dirname, '../ONBOARDING_CHECKLIST.md'),
  path.join(__dirname, '../ONBOARDING_DEV.md'),
  path.join(__dirname, '../mobile/ONBOARDING_MOBILE.md'),
  path.join(__dirname, '../onboarding-checklist.md'),
];
const MICRO_WORKSHOPS_FILE = path.join(__dirname, '../prompts/AI_MICRO_WORKSHOPS.md');

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getClosedIssues() {
  const issues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    labels: 'onboarding,lessons learned,audit',
    per_page: 100,
    since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return issues.data;
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

function updateOnboardingChecklists(item) {
  for (const file of ONBOARDING_CHECKLISTS) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes(item)) {
      content += `\n- [ ] ${item}`;
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Aktualizován onboarding checklist: ${file}`);
    }
  }
}

function proposeMicroWorkshop(topic) {
  let content = '';
  if (fs.existsSync(MICRO_WORKSHOPS_FILE)) {
    content = fs.readFileSync(MICRO_WORKSHOPS_FILE, 'utf8');
  }
  const date = new Date().toISOString().slice(0,10);
  if (!content.includes(topic)) {
    content += `\n| ${date} | ${topic} | AI agent | Doplnit poznámky |`;
    fs.writeFileSync(MICRO_WORKSHOPS_FILE, content, 'utf8');
    console.log(`Navržen micro-workshop: ${topic}`);
  }
}

async function main() {
  const closedIssues = await getClosedIssues();
  const topics = {};
  for (const issue of closedIssues) {
    const title = issue.title.trim();
    addToLessonsLearned(title);
    updateOnboardingChecklists(title);
    topics[title] = (topics[title] || 0) + 1;
  }
  // Pokud se téma opakuje 2× a více, navrhni micro-workshop
  for (const [topic, count] of Object.entries(topics)) {
    if (count >= 2) {
      proposeMicroWorkshop(topic);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
