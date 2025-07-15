// backend/scripts/ai_innovation_adoption_trends.js
// AI-driven analýza trendů v adopci inovací a automatizací v týmu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_innovation_adoption_trends-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

function getUsageStats() {
  // TODO: Načíst statistiky využití automatizací z DB nebo logů (mock)
  return [
    { name: 'AI Incident Insight', usage: 42 },
    { name: 'AI Governance Report', usage: 37 },
    { name: 'AI Onboarding Checklist', usage: 29 },
    { name: 'AI Retrospective Generator', usage: 15 },
    { name: 'AI Executive Summary', usage: 8 }
  ];
}

async function generateAdoptionTrendsReport(usageStats, innovationTrends, feedback) {
  const prompt = `Jsi AI innovation adoption analyst. Na základě těchto dat:

--- USAGE STATS ---\n${JSON.stringify(usageStats, null, 2)}\n
--- INNOVATION TRENDS ---\n${innovationTrends}\n
--- USER FEEDBACK ---\n${feedback}\n
Analyzuj trendy v adopci inovací a automatizací v týmu: které AI/automatizace jsou nejvíce využívané, kde je odpor, jaké jsou bariéry a motivace. Navrhni konkrétní kroky pro zvýšení adopce a engagementu. Stručně, v bodech.`;
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const usageStats = getUsageStats();
  const innovationTrends = getLatestReport('ai_innovation_trends_report-');
  const feedback = getLatestReport('voice_of_customer-');
  const report = await generateAdoptionTrendsReport(usageStats, innovationTrends, feedback);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Innovation Adoption Trends Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
