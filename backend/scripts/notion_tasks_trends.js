// Skript pro trendovou analýzu Notion úkolů (AI recommendations/lessons learned)
const { Client } = require('@notionhq/client');
const dayjs = require('dayjs');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const DAYS = 30;

async function getTrendData() {
  if (!NOTION_TOKEN || !DATABASE_ID) throw new Error('NOTION_TOKEN nebo NOTION_DATABASE_ID není nastaven');
  const notion = new Client({ auth: NOTION_TOKEN });
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 100
  });
  // Seskupit úkoly podle dne vytvoření a stavu
  const trend = {};
  for (let i = 0; i < DAYS; i++) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    trend[date] = { open: 0, closed: 0 };
  }
  response.results.forEach(page => {
    const created = page.created_time ? dayjs(page.created_time).format('YYYY-MM-DD') : null;
    const status = page.properties.Status?.select?.name || 'Unknown';
    if (created && trend[created]) {
      if (status === 'Open') trend[created].open++;
      if (status === 'Done' || status === 'Closed') trend[created].closed++;
    }
  });
  // Připravit data pro chart.js
  const labels = Object.keys(trend).reverse();
  const openData = labels.map(d => trend[d].open);
  const closedData = labels.map(d => trend[d].closed);
  return {
    labels,
    datasets: [
      {
        label: 'Otevřené',
        data: openData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        label: 'Uzavřené',
        data: closedData,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      }
    ]
  };
}

async function main() {
  return await getTrendData();
}

if (require.main === module) {
  main().then(data => console.log(JSON.stringify(data, null, 2))).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
