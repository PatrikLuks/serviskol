// AI Insight & Prediction pro incident reporty (OpenAI API)
const fs = require('fs');
const path = require('path');
const https = require('https');

const REPORTS_DIR = path.join(__dirname, '../reports');
const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

function getLastReports(n = 5) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith('incident_report-') && f.endsWith('.md') && !f.includes('latest'))
    .sort()
    .slice(-n);
  return files.map(f => fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8'));
}

function buildPrompt(reports) {
  return `Jsi AI analytik bezpečnosti a provozu. Na základě následujících incident & trend reportů analyzuj trendy, predikuj rizika a navrhni konkrétní doporučení pro tým. Piš česky, strukturovaně, v bodech.\n\n${reports.map((r,i)=>`Report ${i+1}:\n${r}`).join('\n\n')}\n\nAI Insight & Prediction:`;
}

async function fetchOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Jsi AI analytik bezpečnosti a provozu.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.2
    });
    const req = https.request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json.choices[0].message.content.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const reports = getLastReports(5);
  if (!API_KEY) throw new Error('OPENAI_API_KEY není nastaven');
  if (reports.length === 0) throw new Error('Žádné incident reporty k analýze');
  const prompt = buildPrompt(reports);
  const insight = await fetchOpenAI(prompt);
  const outPath = path.join(REPORTS_DIR, 'ai_insight-latest.md');
  fs.writeFileSync(outPath, `# AI Insight & Prediction\n\n${insight}\n`);
  console.log(`AI insight uložen do ${outPath}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
