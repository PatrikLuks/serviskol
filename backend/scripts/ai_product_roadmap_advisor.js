// AI Product Roadmap Advisor: Automatizované AI doporučení pro roadmapu
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_product_roadmap_advisor-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chyba: Není nastavena proměnná prostředí OPENAI_API_KEY.');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  return files.length ? fs.readFileSync(path.join(REPORTS_DIR, files[files.length - 1]), 'utf-8') : '';
}

async function generateRoadmapAdvice(incidentTrends, voc, analytics) {
  const prompt = `Jsi AI produktový stratég. Na základě těchto dat:

--- INCIDENT TRENDS ---\n${incidentTrends}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
--- PRODUCT ANALYTICS ---\n${analytics}\n
Navrhni kvartální roadmapu, prioritizuj oblasti s největším dopadem, doporuč konkrétní funkce a vylepšení. Uveď i predikci hlavních rizik a příležitostí. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidentTrends = getLatestReport('incident_trend_report-');
  const voc = getLatestReport('voice_of_customer-');
  const analytics = getLatestReport('product_analytics-');
  if (!incidentTrends && !voc && !analytics) {
    console.error('Chybí podklady pro AI analýzu.');
    process.exit(1);
  }
  const advice = await generateRoadmapAdvice(incidentTrends, voc, analytics);
  fs.writeFileSync(OUT_PATH, advice);
  console.log(`AI Product Roadmap Advisor report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => {
    console.error('Chyba v AI Product Roadmap Advisor:', e);
    process.exit(1);
  });
}

module.exports = { main };
