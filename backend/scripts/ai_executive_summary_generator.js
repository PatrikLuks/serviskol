// backend/scripts/ai_executive_summary_generator.js
// AI-driven kvartální executive summary pro vedení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_executive_summary_generator-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateExecutiveSummary(auditLog, roadmap, incidents, lessons, bestPractices, knowledgeBase, analytics) {
  const prompt = `Jsi AI executive summary coach. Na základě těchto dat:

--- AI AUDIT LOG ---\n${auditLog}\n
--- ROADMAP ---\n${roadmap}\n
--- INCIDENTS ---\n${incidents}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- BEST PRACTICES ---\n${bestPractices}\n
--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
--- ANALYTICS ---\n${analytics}\n
Vytvoř kvartální shrnutí pro vedení: hlavní trendy, úspěchy, slabiny, lessons learned, doporučení pro růst a inovace. Stručně, v bodech, srozumitelně pro management.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const auditLog = getLatestReport('ai_audit_log-');
  const roadmap = getLatestReport('ai_product_roadmap_advisor-');
  const incidents = getLatestReport('incident_trend_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const bestPractices = getLatestReport('ai_best_practices_report-');
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  const analytics = getLatestReport('product_analytics-');
  const report = await generateExecutiveSummary(auditLog, roadmap, incidents, lessons, bestPractices, knowledgeBase, analytics);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Executive Summary Generator Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
