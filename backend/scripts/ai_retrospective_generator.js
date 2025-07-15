// backend/scripts/ai_retrospective_generator.js
// AI-driven kvartální retrospektiva & lessons learned pro tým
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_retrospective_generator-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateRetrospective(incidents, lessons, bestPractices, knowledgeBase) {
  const prompt = `Jsi AI retrospektiva coach. Na základě těchto dat:

--- INCIDENTS ---\n${incidents}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- BEST PRACTICES ---\n${bestPractices}\n
--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
Vytvoř kvartální retrospektivu: hlavní trendy, úspěchy, slabiny, lessons learned, doporučení pro další období. Uveď konkrétní akční kroky pro tým. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidents = getLatestReport('incident_trend_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const bestPractices = getLatestReport('ai_best_practices_report-');
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  const report = await generateRetrospective(incidents, lessons, bestPractices, knowledgeBase);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Retrospective Generator Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
