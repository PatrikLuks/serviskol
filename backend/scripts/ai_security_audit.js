// AI Security Audit: Automatizovaný bezpečnostní audit kódu, workflow a AI automatizací
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_security_audit-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chyba: Není nastavena proměnná prostředí OPENAI_API_KEY.');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function getFileContentIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function getAllWorkflowFiles() {
  const workflowsDir = path.join(__dirname, '../.github/workflows');
  if (!fs.existsSync(workflowsDir)) return [];
  return fs.readdirSync(workflowsDir)
    .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map(f => path.join(workflowsDir, f));
}

async function generateSecurityAudit(server, frontend, workflows, auditLog) {
  const prompt = `Jsi AI bezpečnostní auditor. Proveď bezpečnostní audit tohoto projektu na základě těchto dat:

--- BACKEND ---\n${server}\n
--- FRONTEND ---\n${frontend}\n
--- WORKFLOWS ---\n${workflows}\n
--- AI AUDIT LOG ---\n${auditLog}\n
Identifikuj potenciální bezpečnostní rizika (včetně zneužití AI), slabá místa v kódu, závislostech a automatizacích. Navrhni konkrétní preventivní opatření. Stručně, v bodech.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const server = getFileContentIfExists(path.join(__dirname, '../backend/server.js'));
  const frontend = getFileContentIfExists(path.join(__dirname, '../frontend/src/main.js'));
  const workflowFiles = getAllWorkflowFiles();
  const workflows = workflowFiles.map(f => `--- ${path.basename(f)} ---\n` + getFileContentIfExists(f)).join('\n');
  const auditLog = getFileContentIfExists(path.join(REPORTS_DIR, fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith('ai_audit_log-')).sort().reverse()[0] || ''));
  if (!server && !frontend && !workflows) {
    console.error('Chybí podklady pro AI Security Audit.');
    process.exit(1);
  }
  const report = await generateSecurityAudit(server, frontend, workflows, auditLog);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Security Audit uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
