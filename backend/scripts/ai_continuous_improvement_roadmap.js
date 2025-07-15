// backend/scripts/ai_continuous_improvement_roadmap.js
// AI-driven kontinuální improvement roadmapa pro tým na základě trendů, lessons learned, best practices a inovací
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_continuous_improvement_roadmap-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function generateImprovementRoadmap(trends, lessons, bestPractices, knowledgeBase, innovation) {
  const prompt = `Jsi AI improvement roadmap coach. Na základě těchto dat:

--- TRENDS ---\n${trends}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- BEST PRACTICES ---\n${bestPractices}\n
--- TEAM KNOWLEDGE BASE ---\n${knowledgeBase}\n
--- INNOVATION ---\n${innovation}\n
Navrhni kontinuální improvement roadmapu pro tým: priority, konkrétní akční kroky, metriky, inovace, doporučení pro další období. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const trends = getLatestReport('ai_trend_scout-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const bestPractices = getLatestReport('ai_best_practices_report-');
  const knowledgeBase = getLatestReport('ai_team_knowledge_base_report-');
  const innovation = getLatestReport('ai_innovation_trends_report-');
  const report = await generateImprovementRoadmap(trends, lessons, bestPractices, knowledgeBase, innovation);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Continuous Improvement Roadmap uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
