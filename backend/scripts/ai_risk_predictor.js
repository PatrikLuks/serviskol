// AI Risk Predictor: Automatizovaná AI predikce rizik a slabých míst
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_risk_predictor-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateRiskAnalysis(incidentTrends, e2e, monitoring, voc) {
  const prompt = `Jsi AI expert na řízení kvality a prevenci incidentů. Na základě těchto dat:

--- INCIDENT TRENDS ---\n${incidentTrends}\n
--- E2E TESTS ---\n${e2e}\n
--- MONITORING ---\n${monitoring}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
Identifikuj oblasti s nejvyšším rizikem selhání nebo nespokojenosti uživatelů. Navrhni konkrétní preventivní zásahy a doporučení pro vývoj. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidentTrends = getLatestReport('incident_trend_report-');
  const e2e = getLatestReport('e2e_test_report-');
  const monitoring = getLatestReport('monitoring_report-');
  const voc = getLatestReport('voice_of_customer-');
  if (!incidentTrends && !e2e && !monitoring && !voc) {
    console.error('Chybí podklady pro AI analýzu.');
    process.exit(1);
  }
  const analysis = await generateRiskAnalysis(incidentTrends, e2e, monitoring, voc);
  fs.writeFileSync(OUT_PATH, analysis);
  console.log(`AI Risk Predictor report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
