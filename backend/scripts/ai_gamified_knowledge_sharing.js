// backend/scripts/ai_gamified_knowledge_sharing.js
// AI-driven gamifikace sdílení znalostí, best practices a lessons learned v týmu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_gamified_knowledge_sharing-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateGamifiedSharingReport(knowledgeBase, lessons, bestPractices) {
  const prompt = `Jsi AI knowledge sharing coach. Na základě těchto dat:

--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- BEST PRACTICES ---\n${bestPractices}\n
Navrhni gamifikovaný systém sdílení znalostí v týmu: micro-workshopy, mentoring, bodování, odměny, leaderboard, AI-driven doporučení. Uveď konkrétní akční kroky, motivace a metriky. Stručně, v bodech.`;
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
  const lessons = getLatestReport('ai_lessons_learned-');
  const bestPractices = getLatestReport('ai_best_practices_report-');
  const report = await generateGamifiedSharingReport(knowledgeBase, lessons, bestPractices);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Gamified Knowledge Sharing Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
