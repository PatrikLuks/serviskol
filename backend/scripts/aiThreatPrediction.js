// AI predikce útoků a anomálií na základě historických logů a incidentů
// Vstup: logs/security.log, reports/incident.log
// Výstup: reports/ai_threat_prediction_YYYY-MM-DD.md

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { Configuration, OpenAIApi } = require('openai');

const SECURITY_LOG = path.resolve(__dirname, '../logs/security.log');
const INCIDENT_LOG = path.resolve(__dirname, '../reports/incident.log');
const OUT_PATH = path.resolve(__dirname, `../reports/ai_threat_prediction_${dayjs().format('YYYY-MM-DD')}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chybí OPENAI_API_KEY v prostředí.');
  process.exit(1);
}

function readLogSafe(p) {
  if (!fs.existsSync(p)) return '';
  return fs.readFileSync(p, 'utf8');
}

async function main() {
  const securityLog = readLogSafe(SECURITY_LOG);
  const incidentLog = readLogSafe(INCIDENT_LOG);
  const prompt = `Analyzuj následující bezpečnostní logy a incidenty. Identifikuj vzorce, trendy, opakující se typy útoků nebo anomálií. Na základě dat predikuj, jaké typy útoků nebo incidentů hrozí v nejbližší době, a navrhni preventivní opatření. Odpověz česky, strukturovaně v markdown.\n\n---\nBEZPEČNOSTNÍ LOGY:\n${securityLog.substring(securityLog.length-5000)}\n\n---\nINCIDENTY:\n${incidentLog.substring(incidentLog.length-5000)}\n`;

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  const summary = aiResp.data.choices[0].message.content;
  fs.writeFileSync(OUT_PATH, summary);
  console.log('AI predikce útoků/anomálií uložena do:', OUT_PATH);
}

if (require.main === module) {
  main();
}
