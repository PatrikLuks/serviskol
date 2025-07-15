// backend/scripts/ai_whatif_simulation.js
// AI-driven simulace "co kdyby" pro predikci dopadů neřešených slabin a backlogu
require('dotenv').config();
const { Client } = require('@notionhq/client');
const axios = require('axios');
const fs = require('fs');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

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

async function simulateWhatIf(tasks) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY není nastaven');
  if (!tasks.length) return 'Všechny slabiny/backlog jsou vyřešeny.';
  const prompt = `Jsi AI strategický analytik. Zde je seznam otevřených slabin/backlogu (nerealizovaných doporučení):\n${tasks.map(t => `- ${t.title}`).join('\n')}\n\nSimuluj, jaké negativní scénáře mohou nastat, pokud zůstanou neřešené (provoz, bezpečnost, compliance, UX, reputace, růst). Navrhni konkrétní priority a mitigace. Stručně, v bodech.`;
  const res = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na strategické simulace a risk management.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  }, {
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
  });
  return res.data.choices[0].message.content;
}

async function main() {
  const tasks = await getOpenTasks();
  const simulation = await simulateWhatIf(tasks);
  fs.writeFileSync('reports/ai_whatif_simulation.md', simulation);
  console.log('AI What-If Simulation Report uložen do reports/ai_whatif_simulation.md');
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
