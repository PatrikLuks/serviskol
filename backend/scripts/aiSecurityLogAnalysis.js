// AI analýza bezpečnostních logů pro ServisKol
// Vstup: logs/security.log (nebo jiný log soubor)
// Výstup: AI sumarizace, predikce rizik, doporučení

const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const LOG_PATH = path.resolve(__dirname, '../logs/security.log');
const OUTPUT_PATH = path.resolve(__dirname, '../reports/ai_security_analysis.md');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chybí OPENAI_API_KEY v prostředí.');
  process.exit(1);
}

async function analyzeLog() {
  if (!fs.existsSync(LOG_PATH)) {
    console.error('Logovací soubor neexistuje:', LOG_PATH);
    process.exit(1);
  }
  const logContent = fs.readFileSync(LOG_PATH, 'utf8');
  const prompt = `Analyzuj následující bezpečnostní logy a:
- Detekuj podezřelé aktivity, pokusy o útok, slabá místa
- Navrhni preventivní opatření
- Vytvoř stručné shrnutí a doporučení pro management

Logy:
${logContent}

Odpověz česky, strukturovaně v markdown.`;

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const aiResp = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  const summary = aiResp.data.choices[0].message.content;
  fs.writeFileSync(OUTPUT_PATH, summary);
  console.log('AI bezpečnostní analýza uložena do:', OUTPUT_PATH);
}

if (require.main === module) {
  analyzeLog();
}
