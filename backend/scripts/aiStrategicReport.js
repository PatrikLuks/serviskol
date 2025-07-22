// AI strategický report pro management – sumarizace bezpečnosti, compliance, incidentů, self-healing a roadmapa zlepšení
// Vstup: compliance report, AI analýzy, incidenty, self-healing logy
// Výstup: reports/ai_strategic_report_YYYY-MM-DD.md

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const { Configuration, OpenAIApi } = require('openai');

const COMPLIANCE_REPORT = path.resolve(__dirname, `../reports/compliance_report_${dayjs().format('YYYY-MM-DD')}.txt`);
const SECURITY_ANALYSIS = path.resolve(__dirname, '../reports/ai_security_analysis.md');
const PENTEST_ANALYSIS = path.resolve(__dirname, '../reports/ai_pentest_analysis.md');
const THREAT_PREDICTION = path.resolve(__dirname, `../reports/ai_threat_prediction_${dayjs().format('YYYY-MM-DD')}.md`);
const INCIDENT_LOG = path.resolve(__dirname, '../reports/incident.log');
const SELF_HEALING_LOG = path.resolve(__dirname, '../logs/self_healing.log');
const OUT_PATH = path.resolve(__dirname, `../reports/ai_strategic_report_${dayjs().format('YYYY-MM-DD')}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function readSafe(p, max = 4000) {
  if (!fs.existsSync(p)) return '';
  const content = fs.readFileSync(p, 'utf8');
  return content.length > max ? content.substring(content.length - max) : content;
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('Chybí OPENAI_API_KEY v prostředí.');
    process.exit(1);
  }
  const compliance = readSafe(COMPLIANCE_REPORT);
  const security = readSafe(SECURITY_ANALYSIS);
  const pentest = readSafe(PENTEST_ANALYSIS);
  const threat = readSafe(THREAT_PREDICTION);
  const incidents = readSafe(INCIDENT_LOG, 2000);
  const healing = readSafe(SELF_HEALING_LOG, 2000);

  const prompt = `Jsi AI bezpečnostní stratég. Na základě následujících reportů a logů:
- Shrň stav bezpečnosti, compliance, incidentů a self-healingu
- Identifikuj trendy, slabá místa, úspěchy a rizika
- Navrhni konkrétní roadmapu zlepšení na další kvartál
- Odpověz česky, strukturovaně v markdown

---
COMPLIANCE REPORT:
${compliance}

---
AI SECURITY ANALYSIS:
${security}

---
AI PENTEST ANALYSIS:
${pentest}

---
AI THREAT PREDICTION:
${threat}

---
INCIDENT LOG:
${incidents}

---
SELF-HEALING LOG:
${healing}
`;

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1200
  });
  const summary = aiResp.data.choices[0].message.content;
  fs.writeFileSync(OUT_PATH, summary);
  console.log('AI strategický report vygenerován:', OUT_PATH);
}

if (require.main === module) {
  main();
}
