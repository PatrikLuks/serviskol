// Skript pro reporting stavu Notion úkolů z lessons learned/AI recommendations
const { Client } = require('@notionhq/client');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

async function getNotionTasks() {
  if (!NOTION_TOKEN || !DATABASE_ID) throw new Error('NOTION_TOKEN nebo NOTION_DATABASE_ID není nastaven');
  const notion = new Client({ auth: NOTION_TOKEN });
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 100
  });
  return response.results.map(page => ({
    id: page.id,
    title: page.properties.Name?.title?.[0]?.plain_text || '',
    status: page.properties.Status?.select?.name || 'Unknown',
    url: page.url
  }));
}

async function main() {
  const tasks = await getNotionTasks();
  const open = tasks.filter(t => t.status === 'Open');
  const closed = tasks.filter(t => t.status === 'Done' || t.status === 'Closed');
  const unknown = tasks.filter(t => t.status === 'Unknown');
  console.log('--- Notion úkoly (AI recommendations/lessons learned) ---');
  console.log('Otevřené:', open.length);
  open.forEach(t => console.log(`- [ ] ${t.title} (${t.url})`));
  console.log('Uzavřené:', closed.length);
  closed.forEach(t => console.log(`- [x] ${t.title} (${t.url})`));
  if (unknown.length) {
    console.log('Neznámý stav:', unknown.length);
    unknown.forEach(t => console.log(`- [?] ${t.title} (${t.url})`));
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
