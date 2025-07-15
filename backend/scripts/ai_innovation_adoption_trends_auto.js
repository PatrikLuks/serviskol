// Automatizovaný AI report trendů inovací a adopce AI v týmu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_innovation_adoption_trends-latest.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chybí OPENAI_API_KEY v .env');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith(prefix));
  if (!files.length) return '';
  const latest = files.sort().reverse()[0];
  return fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf-8');
}

async function generateInnovationTrendsReport(tips, prompts, workshops, feedback) {
  const prompt = `Jsi AI innovation scout. Na základě těchto dat:
--- TIPS ---\n${tips}\n--- PROMPTS ---\n${prompts}\n--- WORKSHOPS ---\n${workshops}\n--- FEEDBACK ---\n${feedback}\n
Analyzuj trendy inovací, adopce AI a experimentů v týmu. Navrhni konkrétní doporučení pro další rozvoj. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const tips = getLatestReport('ai_tips-');
  const prompts = getLatestReport('prompts-');
  const workshops = getLatestReport('ai_micro_workshop-');
  const feedback = getLatestReport('ai_feedback-');
  if (!tips && !prompts && !workshops && !feedback) {
    console.error('Chybí podklady pro innovation trends report.');
    process.exit(1);
  }
  const report = await generateInnovationTrendsReport(tips, prompts, workshops, feedback);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Innovation Adoption Trends report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}
