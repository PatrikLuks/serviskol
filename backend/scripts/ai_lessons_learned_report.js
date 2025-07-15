// backend/scripts/ai_lessons_learned_report.js
// AI Lessons Learned Report: Automatizované shrnutí poučení, trendů a doporučení z incidentů, governance, security a retrospektiv
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_lessons_learned_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateLessonsLearnedReport(reports) {
  const prompt = `Jsi AI governance a resilience auditor. Na základě těchto reportů:\n${reports.map((r,i)=>`--- REPORT ${i+1} ---\n${r}`).join('\n')}\n\nShrň hlavní lessons learned, trendy v incidentech, governance, security a doporučení pro další kvartál. Stručně, v bodech, pro vedení i tým.`;
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
    'ai_governance_report-',
    'ai_security_audit-',
    'ai_compliance_report-',
    'ai_audit_log-',
    'retrospective-'
  ]);
  if (!reports.some(Boolean)) {
    console.error('Chybí podklady pro lessons learned report.');
    process.exit(1);
  }
  const report = await generateLessonsLearnedReport(reports);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Lessons Learned Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
