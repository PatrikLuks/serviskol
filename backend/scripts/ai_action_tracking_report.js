// backend/scripts/ai_action_tracking_report.js
// AI Action Tracking Report: Automatizované sledování plnění akčních kroků z governance, security, compliance a onboarding reportů
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_action_tracking_report-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chyba: Není nastavena proměnná prostředí OPENAI_API_KEY.');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestReports(prefixes) {
  return prefixes.map(prefix => {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith(prefix)).sort().reverse();
    if (!files.length) return '';
    return fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8');
  });
}

async function generateActionTrackingReport(reports) {
  const prompt = `Jsi AI governance auditor. Na základě těchto reportů:\n${reports.map((r,i)=>`--- REPORT ${i+1} ---\n${r}`).join('\n')}\n\nIdentifikuj všechny akční kroky, jejich stav plnění, případné blokace nebo zpoždění. Navrhni konkrétní opatření pro eskalaci, reporting a zlepšení. Stručně, v bodech, pro vedení.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const reports = getLatestReports([
    'ai_governance_report-',
    'ai_security_audit-',
    'ai_compliance_report-',
    'ai_onboarding_executive_summary-'
  ]);
  if (!reports.some(Boolean)) {
    console.error('Chybí podklady pro action tracking report.');
    process.exit(1);
  }
  const report = await generateActionTrackingReport(reports);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Action Tracking Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
