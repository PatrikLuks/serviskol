// AI Trend Scout: Automatizovaný scouting technologických a produktových trendů
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
const https = require('https');

const REPORTS_DIR = path.join(__dirname, '../reports');
const OUT_PATH = path.join(REPORTS_DIR, `ai_trend_scout-${new Date().toISOString().slice(0,10)}.md`);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Chyba: Není nastavena proměnná prostředí OPENAI_API_KEY.');
  process.exit(1);
}

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchTrendingData() {
  // Získání dat z několika zdrojů (základní ukázka)
  const sources = [
    { name: 'GitHub Trending', url: 'https://github.com/trending' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com/' },
    { name: 'Product Hunt', url: 'https://www.producthunt.com/' }
  ];
  const results = [];
  for (const src of sources) {
    try {
      const html = await fetchUrl(src.url);
      results.push(`--- ${src.name} ---\n${html.slice(0, 2000)}...`); // Omezit délku
    } catch (e) {
      results.push(`--- ${src.name} ---\nChyba načítání: ${e}`);
    }
  }
  return results.join('\n');
}

async function generateTrendReport(trends) {
  const prompt = `Jsi AI produktový scout. Na základě těchto dat z trendových zdrojů:
\n${trends}\n
Vytvoř report pro produktový tým: jaké trendy, technologie nebo inspirace by měl tým sledovat, testovat nebo implementovat? Stručně, v bodech, s odkazy na zdroje.`;
  const res = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 900
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const trends = await fetchTrendingData();
  const report = await generateTrendReport(trends);
  fs.writeFileSync(OUT_PATH, report);
  console.log(`AI Trend Scout Report uložen do ${OUT_PATH}`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
