// backend/scripts/ai_change_impact_simulation.js
// AI-driven simulace dopadů změn v procesech (change impact analysis)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_change_impact_simulation-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function getRecentChanges() {
  // TODO: Načíst poslední změny v procesech/workflow z DB nebo audit logu (mock)
  return [
    { change: 'Zavedení nového schvalovacího workflow pro onboarding', date: '2025-07-01' },
    { change: 'Automatizace exportu knowledge base do SIEM', date: '2025-06-20' },
    { change: 'Přidání AI sentiment analýzy do dashboardu', date: '2025-06-10' }
  ];
}

async function generateChangeImpactSimulation(changes, auditLog, incidents, feedback) {
  const prompt = `Jsi AI change impact analyst. Na základě těchto dat:

--- RECENT CHANGES ---\n${JSON.stringify(changes, null, 2)}\n
--- AUDIT LOG ---\n${auditLog}\n
--- INCIDENTS ---\n${incidents}\n
--- USER FEEDBACK ---\n${feedback}\n
Simuluj možné dopady těchto změn na provoz, bezpečnost, compliance, UX, týmovou efektivitu. Uveď konkrétní rizika, příležitosti a doporučení. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const changes = getRecentChanges();
  const auditLog = getLatestReport('ai_audit_log-');
  const incidents = getLatestReport('incident_trend_report-');
  const feedback = getLatestReport('voice_of_customer-');
  const report = await generateChangeImpactSimulation(changes, auditLog, incidents, feedback);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Change Impact Simulation Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
