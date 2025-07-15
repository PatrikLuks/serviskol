// backend/scripts/ai_escalate_unrealized_recommendations.js
// Automatizovaná eskalace nerealizovaných AI doporučení (Notion backlog) vedení
require('dotenv').config();
const { Client } = require('@notionhq/client');
const axios = require('axios');
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;
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

async function escalateToSlack(tasks) {
  if (!SLACK_WEBHOOK) throw new Error('SLACK_WEBHOOK_URL není nastaven');
  if (!tasks.length) return;
  const text = `🚨 *Eskalace nerealizovaných AI doporučení (Notion backlog)* 🚨\nOtevřené úkoly:\n` +
    tasks.map(t => `- ${t.title} (<${t.url}|detail>)`).join('\n');
  await axios.post(SLACK_WEBHOOK, { text });
}

async function main() {
  const tasks = await getOpenTasks();
  if (!tasks.length) {
    console.log('Všechny AI doporučení jsou realizována.');
    return;
  }
  await escalateToSlack(tasks);
  console.log(`Eskalováno ${tasks.length} nerealizovaných doporučení vedení.`);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
