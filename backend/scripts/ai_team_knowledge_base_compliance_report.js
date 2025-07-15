// backend/scripts/ai_team_knowledge_base_compliance_report.js
// AI-driven compliance report z týmového knowledge base pro auditora a vedení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_team_knowledge_base_compliance_report-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateComplianceReport(knowledgeBase) {
  const prompt = `Jsi AI compliance auditor. Na základě týmového knowledge base:

--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
Vytvoř compliance report pro auditora a vedení: zhodnoť soulad s GDPR, bezpečnostními a governance zásadami, identifikuj případná rizika, navrhni konkrétní doporučení a akční kroky. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  if (!knowledgeBase) throw new Error('Chybí týmový knowledge base report.');
  const report = await generateComplianceReport(knowledgeBase);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Team Knowledge Base Compliance Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
