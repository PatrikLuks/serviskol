// AI Executive Summary: Automatizované kvartální shrnutí pro vedení
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_executive_summary-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateExecutiveSummary(auditLog, roadmap, incidents, voc, analytics) {
  const prompt = `Jsi AI analytik pro vedení firmy. Na základě těchto dat:

--- AI AUDIT LOG ---\n${auditLog}\n
--- ROADMAP ---\n${roadmap}\n
--- INCIDENTS ---\n${incidents}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
--- ANALYTICS ---\n${analytics}\n
Vytvoř kvartální shrnutí pro vedení: hlavní trendy, úspěchy, rizika, doporučení pro růst a inovace. Stručně, v bodech, srozumitelně pro management.`;
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
  const incidents = getLatestReport('incident_trend_report-');
  const voc = getLatestReport('voice_of_customer-');
  const analytics = getLatestReport('product_analytics-');
  if (!auditLog && !roadmap && !incidents && !voc && !analytics) {
    console.error('Chybí podklady pro AI Executive Summary.');
    process.exit(1);
  }
  const summary = await generateExecutiveSummary(auditLog, roadmap, incidents, voc, analytics);
  fs.writeFileSync(OUT_PATH, summary);
  console.log(`AI Executive Summary uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
