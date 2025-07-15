// AI Explainability Report: Vysvětlení AI rozhodnutí a doporučení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_explainability_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateExplainability(auditLog, roadmap, impact, lessons, voc) {
  const prompt = `Jsi AI explainability analytik. Na základě těchto AI-driven výstupů:

--- AI AUDIT LOG ---\n${auditLog}\n
--- ROADMAP ---\n${roadmap}\n
--- IMPACT REPORT ---\n${impact}\n
--- LESSONS LEARNED ---\n${lessons}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
Vysvětli, proč AI doporučila konkrétní kroky, jaká data a trendy k tomu vedly, a jaká byla logika rozhodování. Uveď i případná omezení nebo nejistoty. Stručně, v bodech, pro vedení i tým.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const auditLog = getLatestReport('ai_audit_log-');
  const roadmap = getLatestReport('ai_product_roadmap_advisor-');
  const impact = getLatestReport('ai_impact_report-');
  const lessons = getLatestReport('ai_lessons_learned-');
  const voc = getLatestReport('voice_of_customer-');
  if (!auditLog && !roadmap && !impact && !lessons && !voc) {
    console.error('Chybí podklady pro Explainability Report.');
    process.exit(1);
  }
  const report = await generateExplainability(auditLog, roadmap, impact, lessons, voc);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Explainability Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
