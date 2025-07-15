// AI Self-Improvement Loop: Automatizovaná optimalizace AI doporučení a workflow
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_self_improvement-${new Date().toISOString().slice(0,10)}.md`);
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

function getHitlLog() {
  const logPath = path.join(REPORTS_DIR, 'ai_hitl_log.json');
  if (!fs.existsSync(logPath)) return [];
  return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
}

async function generateSelfImprovementReport(hitlLog, impact, lessons, voc) {
  const prompt = `Jsi AI optimalizátor. Na základě těchto dat:

--- HUMAN-IN-THE-LOOP LOG ---\n${JSON.stringify(hitlLog, null, 2)}\n
--- IMPACT REPORT ---\n${impact}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
Vyhodnoť úspěšnost schválených/implementovaných AI návrhů, navrhni konkrétní úpravy promptů, workflow nebo rozhodovacích pravidel pro zvýšení přínosu AI automatizace. Stručně, v bodech, pro tým i AI vývojáře.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const hitlLog = getHitlLog();
  const impact = getLatestReport('ai_impact_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const voc = getLatestReport('voice_of_customer-');
  if (!hitlLog.length && !impact && !lessons && !voc) {
    console.error('Chybí podklady pro Self-Improvement Report.');
    process.exit(1);
  }
  const report = await generateSelfImprovementReport(hitlLog, impact, lessons, voc);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Self-Improvement Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
