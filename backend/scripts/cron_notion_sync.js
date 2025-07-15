// Cron skript pro pravidelnou synchronizaci doporučení do Notion (např. každý den v noci)
const { main: syncNotion } = require('./create_notion_tasks_from_ai');

async function cronSync() {
  try {
    await syncNotion();
    console.log('Notion sync OK');
  } catch (e) {
    console.error('Notion sync ERROR:', e.message);
  }
}

if (require.main === module) {
  cronSync();
}

module.exports = { cronSync };
