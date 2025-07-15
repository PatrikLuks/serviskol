// Skript pro AI predikci dopadu nerealizovaných doporučení (Notion úkolů)
const { Client } = require('@notionhq/client');
const axios = require('axios');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function getOpenTasks() {
  if (!NOTION_TOKEN || !DATABASE_ID) throw new Error('NOTION_TOKEN nebo NOTION_DATABASE_ID není nastaven');
  const notion = new Client({ auth: NOTION_TOKEN });
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 100
  });
  return response.results.filter(page => {
    const status = page.properties.Status?.select?.name || 'Unknown';
    return status === 'Open';
  }).map(page => ({
    title: page.properties.Name?.title?.[0]?.plain_text || '',
    url: page.url,
    created: page.created_time
  }));
}

async function predictImpact(tasks) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY není nastaven');
  if (!tasks.length) return 'Všechny doporučení jsou realizována.';
  const prompt = `Jsi AI governance analytik. Zde je seznam otevřených doporučení (nerealizovaných Notion úkolů):\n${tasks.map(t => `- ${t.title}`).join('\n')}\n\nPredikuj, jaké negativní dopady může mít jejich nerealizace na provoz, bezpečnost, compliance nebo uživatelskou spokojenost. Uveď konkrétní rizika a doporuč priority řešení.`;
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Jsi AI governance analytik.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400,
    temperature: 0.5
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data.choices[0].message.content.trim();
}

async function main() {
  const openTasks = await getOpenTasks();
  const impact = await predictImpact(openTasks);
  console.log(impact);
  return impact;
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
