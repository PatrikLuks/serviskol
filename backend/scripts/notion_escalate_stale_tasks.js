// Skript pro trendovou analýzu a eskalaci neřešených Notion úkolů (AI recommendations/lessons learned)
const { Client } = require('@notionhq/client');
const nodemailer = require('nodemailer');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ESCALATE_AFTER_DAYS = 14;
const ESCALATE_EMAIL = process.env.ESCALATE_EMAIL;

async function getStaleTasks() {
  if (!NOTION_TOKEN || !DATABASE_ID) throw new Error('NOTION_TOKEN nebo NOTION_DATABASE_ID není nastaven');
  const notion = new Client({ auth: NOTION_TOKEN });
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    page_size: 100
  });
  const now = new Date();
  return response.results.filter(page => {
    const status = page.properties.Status?.select?.name || 'Unknown';
    if (status !== 'Open') return false;
    const created = page.created_time ? new Date(page.created_time) : null;
    if (!created) return false;
    const daysOpen = (now - created) / (1000 * 60 * 60 * 24);
    return daysOpen >= ESCALATE_AFTER_DAYS;
  }).map(page => ({
    id: page.id,
    title: page.properties.Name?.title?.[0]?.plain_text || '',
    url: page.url,
    daysOpen: Math.floor((now - new Date(page.created_time)) / (1000 * 60 * 60 * 24))
  }));
}

async function sendEscalationEmail(staleTasks) {
  if (!ESCALATE_EMAIL) throw new Error('ESCALATE_EMAIL není nastaven');
  if (!staleTasks.length) return;
  const transporter = nodemailer.createTransport({ sendmail: true });
  const subject = 'Eskalace neřešených doporučení (ServisKol)';
  const body = `Následující doporučení jsou otevřená více než ${ESCALATE_AFTER_DAYS} dní:\n\n` +
    staleTasks.map(t => `- [${t.daysOpen} dní] ${t.title} (${t.url})`).join('\n');
  await transporter.sendMail({
    from: 'serviskol@localhost',
    to: ESCALATE_EMAIL,
    subject,
    text: body
  });
  console.log('Eskalace odeslána:', ESCALATE_EMAIL);
}

async function main() {
  const staleTasks = await getStaleTasks();
  await sendEscalationEmail(staleTasks);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
