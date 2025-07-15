// backend/scripts/ai_disaster_recovery_report.js
// AI Disaster Recovery Report: Automatizované sledování testů obnovy záloh, simulací výpadků a doporučení pro zvýšení resilience
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_disaster_recovery_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateDisasterRecoveryReport(reports) {
  const prompt = `Jsi AI resilience expert. Na základě těchto reportů:\n${reports.map((r,i)=>`--- REPORT ${i+1} ---\n${r}`).join('\n')}\n\nVyhodnoť stav disaster recovery: testy obnovy záloh, simulace výpadků, slabiny, doporučení pro zvýšení resilience. Stručně, v bodech, pro vedení.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const reports = getLatestReports([
    'ai_resilience_report-',
    'ai_security_audit-',
    'ai_compliance_report-',
    'ai_audit_log-'
  ]);
  if (!reports.some(Boolean)) {
    console.error('Chybí podklady pro disaster recovery report.');
    process.exit(1);
  }
  const report = await generateDisasterRecoveryReport(reports);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Disaster Recovery Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
