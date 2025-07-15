// Automatizované sdílení reportů (lessons learned, onboarding, inovace) na Slack a do Notion
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sendSlackNotification } = require('../utils/slackNotifier');
const { Client } = require('@notionhq/client');

const REPORTS_DIR = path.join(__dirname, '../reports');
const SLACK_CHANNEL = process.env.SLACK_REPORT_CHANNEL || '#team-updates';
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR).filter(f => f.startsWith(prefix));
  if (!files.length) return '';
  const latest = files.sort().reverse()[0];
  return fs.readFileSync(path.join(REPORTS_DIR, latest), 'utf-8');
}

async function shareOnSlack(title, content) {
  await sendSlackNotification({
    text: `*${title}*\n${content}`,
    channel: SLACK_CHANNEL
  });
}

async function shareOnNotion(title, content) {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) return;
  const notion = new Client({ auth: NOTION_TOKEN });
  await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: { Title: { title: [{ text: { content: title } }] } },
    children: [{ object: 'block', type: 'paragraph', paragraph: { text: [{ type: 'text', text: { content } }] } }]
  });
}

async function main() {
  const reports = [
    { prefix: 'ai_lessons_learned-', title: 'AI Lessons Learned Report' },
    { prefix: 'ai_onboarding_feedback_analyze-', title: 'AI Onboarding Feedback Report' },
    { prefix: 'ai_innovation_adoption_trends-', title: 'AI Innovation Adoption Trends Report' }
  ];
  for (const r of reports) {
    const content = getLatestReport(r.prefix);
    if (content) {
      await shareOnSlack(r.title, content.slice(0, 4000)); // Slack limit
      await shareOnNotion(r.title, content);
      console.log(`Report ${r.title} sdílen na Slack i do Notion.`);
    }
  }
}

if (require.main === module) {
  main();
}
