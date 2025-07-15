// AI Human-in-the-Loop Approval: Systém pro schvalování AI návrhů člověkem
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const OUT_PATH = path.join(__dirname, '../reports/ai_hitl_log.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'PatrikLuks';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'serviskol';

if (!GITHUB_TOKEN) {
  console.error('Chybí GITHUB_TOKEN v .env');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function loadPendingProposals() {
  // Pro ukázku načte návrhy z draft souboru (může být generováno AI)
  const draftPath = path.join(__dirname, '../reports/ai_pending_proposals.json');
  if (!fs.existsSync(draftPath)) return [];
  return JSON.parse(fs.readFileSync(draftPath, 'utf-8'));
}

function saveHitlLog(log) {
  fs.writeFileSync(OUT_PATH, JSON.stringify(log, null, 2));
}

async function createGithubIssue({ title, body }) {
  const res = await octokit.rest.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title,
    body,
    labels: ['ai', 'human-in-the-loop']
  });
  return res.data.html_url;
}

async function main() {
  const proposals = loadPendingProposals();
  if (!proposals.length) {
    console.log('Žádné návrhy ke schválení.');
    return;
  }
  const log = [];
  for (const proposal of proposals) {
    // Pro ukázku: vyžádat schválení v konzoli (v praxi lze napojit na Slack, email, UI...)
    console.log(`Návrh: ${proposal.title}\n${proposal.body}\nSchválit? (a/n)`);
    const answer = await new Promise(resolve => {
      process.stdin.once('data', d => resolve(d.toString().trim().toLowerCase()));
    });
    if (answer === 'a') {
      const url = await createGithubIssue(proposal);
      log.push({ ...proposal, status: 'approved', url, timestamp: new Date().toISOString() });
      console.log(`✅ Schváleno a vytvořeno: ${url}`);
    } else {
      log.push({ ...proposal, status: 'rejected', timestamp: new Date().toISOString() });
      console.log('❌ Zamítnuto.');
    }
  }
  saveHitlLog(log);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { main };
