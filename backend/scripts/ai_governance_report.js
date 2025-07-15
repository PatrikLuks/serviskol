// AI Governance Report: Audit souladu AI automatizací s etikou, právem a firemními zásadami
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_governance_report-${new Date().toISOString().slice(0,10)}.md`);
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

async function generateGovernanceReport(auditLog, security, explain, voc) {
  const prompt = `Jsi AI governance auditor. Na základě těchto dat:

--- AI AUDIT LOG ---\n${auditLog}\n
--- SECURITY AUDIT ---\n${security}\n
--- EXPLAINABILITY ---\n${explain}\n
--- VOICE OF CUSTOMER ---\n${voc}\n
Zhodnoť soulad AI automatizací s firemními zásadami, etickými standardy a právními požadavky (např. GDPR). Identifikuj případná rizika, navrhni mitigace a doporučení pro odpovědné využívání AI. Stručně, v bodech, pro vedení a compliance.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const auditLog = getLatestReport('ai_audit_log-');
  const security = getLatestReport('ai_security_audit-');
  const explain = getLatestReport('ai_explainability_report-');
  const voc = getLatestReport('voice_of_customer-');
  if (!auditLog && !security && !explain && !voc) {
    console.error('Chybí podklady pro Governance Report.');
    process.exit(1);
  }
  const report = await generateGovernanceReport(auditLog, security, explain, voc);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Governance Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
