// AI Resilience Report: Analýza odolnosti systému a návrhy na zvýšení resilience
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_resilience_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateResilienceReport(incidents, monitoring, tests, security, governance) {
  const prompt = `Jsi AI resilience expert. Na základě těchto dat:

--- INCIDENTS ---\n${incidents}\n
--- MONITORING ---\n${monitoring}\n
--- TESTS ---\n${tests}\n
--- SECURITY AUDIT ---\n${security}\n
--- GOVERNANCE ---\n${governance}\n
Identifikuj slabá místa v odolnosti systému, navrhni konkrétní opatření pro zvýšení resilience (disaster recovery, fallback scénáře, self-healing, atd.). Stručně, v bodech, pro DevOps a vedení.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const incidents = getLatestReport('incident_trend_report-');
  const monitoring = getLatestReport('monitoring_report-');
  const tests = getLatestReport('e2e_test_report-');
  const security = getLatestReport('ai_security_audit-');
  const governance = getLatestReport('ai_governance_report-');
  if (!incidents && !monitoring && !tests && !security && !governance) {
    console.error('Chybí podklady pro Resilience Report.');
    process.exit(1);
  }
  const report = await generateResilienceReport(incidents, monitoring, tests, security, governance);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Resilience Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
