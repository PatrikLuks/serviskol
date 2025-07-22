// Automatizovaný incident response playbook s AI doporučením a možností akce
// Vstup: reports/ai_security_analysis.md nebo reports/ai_threat_prediction_*.md
// Akce: izolace služby, blokace IP, restart, rollback (simulace)
// Všechny kroky jsou logovány do logs/incident_response.log

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Configuration, OpenAIApi } = require('openai');
const dayjs = require('dayjs');

const ANALYSIS_PATH = process.argv[2] || path.resolve(__dirname, '../reports/ai_security_analysis.md');
const LOG_PATH = path.resolve(__dirname, '../logs/incident_response.log');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function logAction(action) {
  const entry = `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] ${action}\n`;
  fs.appendFileSync(LOG_PATH, entry);
  console.log(action);
}

async function getAIActions(analysis) {
  if (!OPENAI_API_KEY) return ['AI není dostupná, proveďte ručně.'];
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Na základě následující bezpečnostní analýzy nebo predikce navrhni konkrétní kroky reakce (incident response) v bodech. Uveď pouze akce, které lze automatizovat (např. izolace služby, blokace IP, restart, rollback, notifikace). Odpověz česky, pouze seznam akcí, každý bod na nový řádek.\n\n---\n${analysis}\n`;
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400
  });
  return aiResp.data.choices[0].message.content.split('\n').map(l => l.trim()).filter(Boolean);
}

function simulateAction(action) {
  // Skutečné akce zde pouze simulujeme/logujeme, v produkci by zde byla integrace na firewall, orchestrátor apod.
  if (/blokace IP/i.test(action)) {
    logAction('Simulace: Blokace podezřelé IP (firewall)');
  } else if (/izolace/i.test(action)) {
    logAction('Simulace: Izolace služby (odpojení od sítě)');
  } else if (/restart/i.test(action)) {
    logAction('Simulace: Restart služby');
  } else if (/rollback/i.test(action)) {
    logAction('Simulace: Rollback na poslední zálohu');
  } else if (/notifikace/i.test(action)) {
    logAction('Simulace: Odeslání notifikace týmu');
  } else {
    logAction('Simulace: ' + action);
  }
}

async function main() {
  if (!fs.existsSync(ANALYSIS_PATH)) {
    logAction('Chybí vstupní AI analýza: ' + ANALYSIS_PATH);
    return;
  }
  const analysis = fs.readFileSync(ANALYSIS_PATH, 'utf8');
  const actions = await getAIActions(analysis);
  logAction('--- Doporučené kroky incident response ---');
  actions.forEach(simulateAction);
  logAction('--- Incident response playbook dokončen ---');
}

if (require.main === module) {
  main();
}
