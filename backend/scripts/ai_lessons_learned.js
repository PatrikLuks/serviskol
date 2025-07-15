// AI Lessons Learned Report: Automatizované shrnutí poučení a doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_lessons_learned-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateLessonsLearned(incidents, retros, audits, impact, voc) {
  const prompt = `Jsi AI facilitátor retrospektiv. Na základě těchto dat:

--- INCIDENTS ---\n${incidents}\n
--- RETROS ---\n${retros}\n
--- AUDITS ---\n${audits}\n
--- IMPACT REPORT ---\n${impact}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
Vytvoř kvartální Lessons Learned report: hlavní poučení, doporučení, anti-patterny a návrhy na zlepšení. Stručně, v bodech, pro celý tým.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidents = getLatestReport('incident_trend_report-');
  const retros = getLatestReport('retrospective_report-');
  const audits = getLatestReport('ai_audit_log-');
  const impact = getLatestReport('ai_impact_report-');
  const voc = getLatestReport('voice_of_customer-');
  if (!incidents && !retros && !audits && !impact && !voc) {
    console.error('Chybí podklady pro Lessons Learned.');
    process.exit(1);
  }
  const report = await generateLessonsLearned(incidents, retros, audits, impact, voc);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Lessons Learned Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
