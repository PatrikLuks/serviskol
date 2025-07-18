// backend/scripts/ai_create_issues_from_audit.js
// Automatizované vytváření GitHub Issues na základě audit reportů
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'PatrikLuks';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'serviskol';
const REPORTS_DIR = path.join(__dirname, '../reports');

if (!GITHUB_TOKEN) {
  console.error('Chybí GITHUB_TOKEN v .env');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function extractRecommendations(reportText) {
  // Extrahuje doporučení z markdown reportu
  const recs = [];
  const lines = reportText.split('\n');
  let inRec = false;
  for (const line of lines) {
    if (line.match(/^##? Doporučení/)) inRec = true;
    else if (inRec && line.match(/^##/)) inRec = false;
    else if (inRec && line.trim().startsWith('- ')) recs.push(line.trim().slice(2));
  }
  return recs;
}

async function createGithubIssue({ title, body }) {
  await octokit.rest.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title,
    body,
    labels: ['audit', 'recommendation']
  });
}

async function main() {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const reportText = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf-8');
    const recs = extractRecommendations(reportText);
    for (const rec of recs) {
      await createGithubIssue({ title: rec, body: `Doporučení z reportu ${file}` });
      console.log(`Vytvořen issue: ${rec}`);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
