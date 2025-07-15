// backend/scripts/ai_team_knowledge_base_report.js
// AI Team Knowledge Base Report: Automatizované shrnutí znalostí, best practices, lessons learned a inovací pro tým
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_team_knowledge_base_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateKnowledgeBaseReport(reports) {
  const prompt = `Jsi AI týmový knowledge base builder. Na základě těchto reportů:\n${reports.map((r,i)=>`--- REPORT ${i+1} ---\n${r}`).join('\n')}\n\nShrň znalosti, best practices, lessons learned a inovace pro tým. Stručně, v bodech, pro sdílení v knowledge base.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const reports = getLatestReports([
    'ai_best_practices_report-',
    'ai_lessons_learned_report-',
    'ai_governance_report-',
    'ai_security_audit-',
    'ai_compliance_report-',
    'ai_onboarding_executive_summary-',
    'ai_innovation_trends_report-'
  ]);
  if (!reports.some(Boolean)) {
    console.error('Chybí podklady pro team knowledge base report.');
    process.exit(1);
  }
  const report = await generateKnowledgeBaseReport(reports);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Team Knowledge Base Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
