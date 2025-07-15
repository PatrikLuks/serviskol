// Automatizovaný AI lessons learned & best practices report
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_lessons_learned-latest.md`);
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

async function generateLessonsLearned(incidents, retros, audits, impact, voc) {
  const prompt = `Jsi AI týmový kouč. Na základě těchto dat:
--- INCIDENTS ---\n${incidents}\n--- RETROS ---\n${retros}\n--- AUDITS ---\n${audits}\n--- IMPACT ---\n${impact}\n--- VOICE OF CUSTOMER ---\n${voc}\n
Shrň hlavní lessons learned, doporučení a best practices pro tým. Uveď konkrétní akční kroky pro zlepšení. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidents = getLatestReport('incident_trend_report-');
  const retros = getLatestReport('retrospective-');
  const audits = getLatestReport('ai_audit_log-');
  const impact = getLatestReport('ai_impact_report-');
  const voc = getLatestReport('voice_of_customer-');
  if (!incidents && !retros && !audits && !impact && !voc) {
    console.error('Chybí podklady pro lessons learned report.');
    process.exit(1);
  }
  const report = await generateLessonsLearned(incidents, retros, audits, impact, voc);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Lessons Learned report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main();
}
