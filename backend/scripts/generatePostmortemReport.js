// Skript pro automatizované post-mortem reporty s AI sumarizací
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const INCIDENT_LOG = path.join(__dirname, '../reports/incident.log');
const POSTMORTEM_DIR = path.join(__dirname, '../postmortems');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chybí OPENAI_API_KEY v prostředí.');
  process.exit(1);
}

const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function generatePostmortem() {
  if (!fs.existsSync(INCIDENT_LOG)) {
    console.error('incident.log nenalezen.');
    process.exit(1);
  }
  const log = fs.readFileSync(INCIDENT_LOG, 'utf-8');
  const lastIncident = log.split('---').filter(Boolean).pop();
  if (!lastIncident) {
    console.error('Žádný incident k analýze.');
    process.exit(1);
  }
  // AI sumarizace příčin a doporučení
  const prompt = `Analyzuj následující incident log a vygeneruj post-mortem report v češtině. Struktura: 1. Shrnutí incidentu, 2. Příčiny, 3. Dopad, 4. Opatření a doporučení pro prevenci.\n\nIncident log:\n${lastIncident}`;
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800
  });
  const aiReport = aiResp.data.choices[0].message.content;
  if (!fs.existsSync(POSTMORTEM_DIR)) fs.mkdirSync(POSTMORTEM_DIR);
  const fileName = `postmortem-${new Date().toISOString().slice(0,10)}.md`;
  fs.writeFileSync(path.join(POSTMORTEM_DIR, fileName), aiReport);
  console.log('Post-mortem report vygenerován:', fileName);
}

generatePostmortem();
