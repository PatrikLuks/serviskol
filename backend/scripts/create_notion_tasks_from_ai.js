// Automatizované vytváření Notion úkolů z AI recommendations/lessons learned
const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const REPORTS_DIR = path.join(__dirname, '../reports');

function extractRecommendations(text) {
  return text.split('\n').filter(l => l.match(/^[-*] |^\d+\./)).map(l => l.replace(/^[-*] |^\d+\.\s*/, '').trim()).filter(Boolean);
}

function getLatestFile(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return null;
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function createNotionTask(notion, title, body) {
  return notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: title } }] },
      Status: { select: { name: 'Open' } }
    },
    children: [
      { object: 'block', type: 'paragraph', paragraph: { text: [{ type: 'text', text: { content: body } }] } }
    ]
  });
}

async function main() {
  if (!NOTION_TOKEN || !DATABASE_ID) throw new Error('NOTION_TOKEN nebo NOTION_DATABASE_ID není nastaven');
  const notion = new Client({ auth: NOTION_TOKEN });
  const aiInsight = getLatestFile('ai_insight-') || '';
  const retro = getLatestFile('retrospective-') || '';
  const aiRecs = extractRecommendations(aiInsight);
  const retroRecs = extractRecommendations(retro);
  const allRecs = [...aiRecs, ...retroRecs];
  if (!allRecs.length) throw new Error('Žádná doporučení k vytvoření Notion úkolů');
  for (const rec of allRecs) {
    try {
      await createNotionTask(notion, rec, 'Automaticky vytvořeno z AI insightu/retrospektivy.');
      console.log(`Vytvořen Notion úkol: ${rec}`);
    } catch (e) {
      console.error(`Chyba při vytváření Notion úkolu '${rec}':`, e.message);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
