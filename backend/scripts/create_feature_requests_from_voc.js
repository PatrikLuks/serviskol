// Automatizované generování feature requests z Voice of Customer reportu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const REPORTS_DIR = path.join(__dirname, '../reports');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'PatrikLuks';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'serviskol';

if (!GITHUB_TOKEN) {
  console.error('Chyba: Není nastavena proměnná prostředí GITHUB_TOKEN.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function getLatestReportPath() {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('voice_of_customer-') && f.endsWith('.md'))
    .sort();
  return files.length ? path.join(REPORTS_DIR, files[files.length - 1]) : null;
}

function extractFeatureIdeas(reportText) {
  // Najdi sekci "Nejčastější témata" a "Ukázky negativní zpětné vazby"
  const topics = [];
  const negative = [];
  const topicsMatch = reportText.match(/## Nejčastější témata\n([\s\S]*?)\n## /);
  if (topicsMatch) {
    topicsMatch[1].split('\n').forEach(line => {
      const m = line.match(/- (.+?) \(/);
      if (m) topics.push(m[1]);
    });
  }
  const negMatch = reportText.match(/## Ukázky negativní zpětné vazby\n([\s\S]*?)\n## |---/);
  if (negMatch) {
    negMatch[1].split('\n').forEach(line => {
      const m = line.match(/- (.+)/);
      if (m) negative.push(m[1]);
    });
  }
  // Kombinuj témata a negativní příklady do návrhů
  const ideas = topics.map(t => ({ title: `Zlepšit oblast: ${t}`, body: `Téma se často objevuje ve zpětné vazbě.` }));
  negative.forEach((n, i) => {
    ideas.push({ title: `Negativní zpětná vazba: ${n.slice(0,50)}...`, body: n });
  });
  return ideas;
}

async function createGithubIssue({ title, body }) {
  await octokit.rest.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title,
    body,
    labels: ['feature-request', 'voice-of-customer']
  });
}

async function main() {
  const reportPath = getLatestReportPath();
  if (!reportPath) {
    console.error('Nenalezen žádný Voice of Customer report.');
    process.exit(1);
  }
  const reportText = fs.readFileSync(reportPath, 'utf-8');
  const ideas = extractFeatureIdeas(reportText);
  if (!ideas.length) {
    console.log('Žádné nové návrhy k vytvoření.');
    return;
  }
  for (const idea of ideas) {
    await createGithubIssue(idea);
    console.log(`Vytvořen issue: ${idea.title}`);
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
