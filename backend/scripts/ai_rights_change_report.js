// backend/scripts/ai_rights_change_report.js
// AI Rights Change Report: Automatizovaný reporting nad změnami práv, detekce podezřelých změn, doporučení pro governance
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_rights_change_report-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chyba: Není nastavena proměnná prostředí OPENAI_API_KEY.');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestAuditLog() {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_audit_log-')).sort().reverse();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[0]), 'utf-8');
}

async function generateRightsReport(auditLog) {
  const prompt = `Jsi AI governance auditor. Na základě tohoto audit logu:\n${auditLog}\n\nIdentifikuj podezřelé změny práv, opakované změny, nedostatečné schvalování, navrhni konkrétní opatření (schvalovací workflow, audit log, alerty, reporting). Stručně, v bodech, pro vedení.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 700
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const auditLog = getLatestAuditLog();
  if (!auditLog) {
    console.error('Chybí audit log pro rights change report.');
    process.exit(1);
  }
  const report = await generateRightsReport(auditLog);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Rights Change Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
