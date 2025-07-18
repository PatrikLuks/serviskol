// Skript: ai_voice_of_customer_report.js
// Popis: Analyzuje zpětnou vazbu uživatelů z MongoDB a reportů, generuje souhrn a navrhuje zlepšení (včetně Issue).

const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');
// const { MongoClient } = require('mongodb'); // odkomentujte pro přímé napojení na DB

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'PatrikLuks';
const REPO_NAME = 'serviskol';

const REPORTS_DIR = path.join(__dirname, '../reports');
const REPORT_FILE = path.join(REPORTS_DIR, `voice_of_customer_summary-${new Date().toISOString().slice(0,10)}.md`);

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function loadFeedbackReports() {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('voice_of_customer-'));
  let all = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(REPORTS_DIR, file), 'utf8');
    all.push(content);
  }
  return all.join('\n');
}

// Pro demo: extrakce témat a ukázek z markdownu (v produkci rozšířit o MongoDB)
function analyzeFeedback(feedbackText) {
  // Zde lze použít AI/LLM pro pokročilou analýzu
  // Pro jednoduchost: najdi sekce "Nejčastější témata", "Ukázky pozitivní/negativní zpětné vazby"
  const topics = feedbackText.match(/## Nejčastější témata([\s\S]*?)## /);
  const positive = feedbackText.match(/## Ukázky pozitivní zpětné vazby([\s\S]*?)## /);
  const negative = feedbackText.match(/## Ukázky negativní zpětné vazby([\s\S]*?)---/);
  return {
    topics: topics ? topics[1].trim() : '',
    positive: positive ? positive[1].trim() : '',
    negative: negative ? negative[1].trim() : '',
  };
}

async function createIssueIfNew(topic) {
  if (!topic || topic.length < 5) return;
  // Zkontroluj, zda už Issue existuje
  const issues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    per_page: 100,
  });
  const exists = issues.data.some(issue => issue.title === topic);
  if (!exists) {
    await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: topic,
      body: 'Nové téma z hlasu zákazníka. Prosím o analýzu a návrh řešení.',
      labels: ['voice-of-customer'],
    });
    console.log('Vytvořeno Issue pro téma:', topic);
  }
}

async function main() {
  const feedbackText = loadFeedbackReports();
  const analysis = analyzeFeedback(feedbackText);
  let report = `# Voice of Customer – Souhrn\n\nDatum: ${new Date().toISOString().slice(0,10)}\n\n`;
  report += '## Nejčastější témata\n' + (analysis.topics || 'Žádná témata nalezena.') + '\n\n';
  report += '## Ukázky pozitivní zpětné vazby\n' + (analysis.positive || '-') + '\n\n';
  report += '## Ukázky negativní zpětné vazby\n' + (analysis.negative || '-') + '\n\n';
  // Pro každé téma navrhni Issue
  if (analysis.topics) {
    const topics = analysis.topics.split('\n').map(t => t.replace(/^[-*] /, '').trim()).filter(Boolean);
    for (const topic of topics) {
      await createIssueIfNew(topic);
    }
  }
  fs.writeFileSync(REPORT_FILE, report, 'utf8');
  console.log('Voice of Customer report vygenerován:', REPORT_FILE);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
