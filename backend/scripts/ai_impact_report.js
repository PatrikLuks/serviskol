// AI Impact Report: Automatizované vyhodnocení dopadu AI automatizací
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_impact_report-${new Date().toISOString().slice(0,10)}.md`);
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'PatrikLuks';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'serviskol';

if (!GITHUB_TOKEN || !OPENAI_API_KEY) {
  console.error('Chybí GITHUB_TOKEN nebo OPENAI_API_KEY v .env');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  return files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[files.length - 1]), 'utf-8') : '';
}

async function getClosedIssues(since) {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    since,
    labels: 'feature-request,voice-of-customer,ai'
  });
  return issues;
}

async function generateImpactReport(auditLog, closedIssues, incidents, voc, analytics) {
  const prompt = `Jsi AI analytik. Na základě těchto dat:

--- AI AUDIT LOG ---\n${auditLog}\n
--- CLOSED ISSUES ---\n${closedIssues.map(i=>`#${i.number}: ${i.title}`).join('\n')}\n
--- INCIDENTS ---\n${incidents}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
--- ANALYTICS ---\n${analytics}\n
Vyhodnoť dopad AI automatizací: kolik doporučení bylo implementováno, jaký měly vliv na incidenty, spokojenost uživatelů, rychlost vývoje. Navrhni metriky pro další sledování. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const auditLog = getLatestReport('ai_audit_log-');
  const incidents = getLatestReport('incident_trend_report-');
  const voc = getLatestReport('voice_of_customer-');
  const analytics = getLatestReport('product_analytics-');
  // Poslední kvartál
  const since = new Date();
  since.setMonth(since.getMonth() - 3);
  const closedIssues = await getClosedIssues(since.toISOString());
  const report = await generateImpactReport(auditLog, closedIssues, incidents, voc, analytics);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Impact Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
