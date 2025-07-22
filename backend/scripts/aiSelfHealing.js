// AI self-healing skript: provede skutečné kroky obnovy, blokace, restartu podle AI doporučení
// Vstup: AI analýza/playbook (např. reports/ai_security_analysis.md)
// Akce: REST API call na firewall, restart služby, obnova DB, rollback
// Vše loguje do logs/self_healing.log

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');
const url = require('url');
const { Configuration, OpenAIApi } = require('openai');
const dayjs = require('dayjs');

const ANALYSIS_PATH = process.argv[2] || path.resolve(__dirname, '../reports/ai_security_analysis.md');
const LOG_PATH = path.resolve(__dirname, '../logs/self_healing.log');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const FIREWALL_API_URL = process.env.FIREWALL_API_URL; // např. https://fw.example.com/api/block
const FIREWALL_API_TOKEN = process.env.FIREWALL_API_TOKEN;

function logAction(action) {
  const entry = `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${action}\n`;
  fs.appendFileSync(LOG_PATH, entry);
  console.log(action);
}

async function getAIActions(analysis) {
  if (!OPENAI_API_KEY) return ['AI není dostupná, proveďte ručně.'];
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Na základě následující bezpečnostní analýzy navrhni konkrétní kroky self-healingu (automatizované reakce) v bodech. Uveď pouze akce, které lze skutečně provést (blokace IP přes API, restart služby, rollback, obnova DB). Každý bod na nový řádek, česky.\n\n---\n${analysis}\n`;
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400
  });
  return aiResp.data.choices[0].message.content.split('\n').map(l => l.trim()).filter(Boolean);
}

function blockIP(ip) {
  if (!FIREWALL_API_URL || !FIREWALL_API_TOKEN) {
    logAction('Chybí FIREWALL_API_URL nebo FIREWALL_API_TOKEN.');
    return;
  }
  const data = JSON.stringify({ ip });
  const fwUrl = url.parse(FIREWALL_API_URL);
  const options = {
    hostname: fwUrl.hostname,
    path: fwUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIREWALL_API_TOKEN}`,
      'Content-Length': data.length
    }
  };
  const req = https.request(options, res => {
    if (res.statusCode === 200) {
      logAction(`IP ${ip} zablokována přes firewall API.`);
    } else {
      logAction(`Chyba při blokaci IP ${ip}: ${res.statusCode}`);
    }
  });
  req.on('error', error => {
    logAction(`Chyba při blokaci IP ${ip}: ${error}`);
  });
  req.write(data);
  req.end();
}

function restartService() {
  try {
    execSync('systemctl restart servis-backend', { stdio: 'ignore' });
    logAction('Služba servis-backend restartována.');
  } catch (e) {
    logAction('Chyba při restartu služby: ' + e.message);
  }
}

function restoreDB() {
  try {
    execSync('bash scripts/restore_mongo.sh posledni_zaloha.gz', { stdio: 'ignore' });
    logAction('Obnova DB ze zálohy provedena.');
  } catch (e) {
    logAction('Chyba při obnově DB: ' + e.message);
  }
}

function rollback() {
  try {
    execSync('git reset --hard HEAD~1', { cwd: path.resolve(__dirname, '../'), stdio: 'ignore' });
    logAction('Rollback na předchozí verzi kódu proveden.');
  } catch (e) {
    logAction('Chyba při rollbacku: ' + e.message);
  }
}

function parseAndRunAction(action) {
  if (/blokace IP.*([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/i.test(action)) {
    const ip = action.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/)[1];
    blockIP(ip);
  } else if (/restart/i.test(action)) {
    restartService();
  } else if (/obnova.*db|obnov/i.test(action)) {
    restoreDB();
  } else if (/rollback/i.test(action)) {
    rollback();
  } else {
    logAction('AI doporučení (ručně ověřit): ' + action);
  }
}

async function main() {
  if (!fs.existsSync(ANALYSIS_PATH)) {
    logAction('Chybí vstupní AI analýza: ' + ANALYSIS_PATH);
    return;
  }
  const analysis = fs.readFileSync(ANALYSIS_PATH, 'utf8');
  const actions = await getAIActions(analysis);
  logAction('--- AI self-healing kroky ---');
  actions.forEach(parseAndRunAction);
  logAction('--- Self-healing dokončen ---');
}

if (require.main === module) {
  main();
}
