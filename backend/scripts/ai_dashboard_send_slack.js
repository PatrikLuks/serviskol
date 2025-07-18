// Skript: ai_dashboard_send_slack.js
// Popis: Odešle dashboard.pdf na Slack pomocí webhooku (Slack API).

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DASHBOARD_PDF = path.join(__dirname, '../reports/dashboard.pdf');

async function sendDashboardToSlack() {
  if (!SLACK_WEBHOOK_URL) {
    console.error('Chybí SLACK_WEBHOOK_URL v env.');
    process.exit(1);
  }
  if (!fs.existsSync(DASHBOARD_PDF)) {
    console.error('Dashboard PDF neexistuje:', DASHBOARD_PDF);
    process.exit(1);
  }
  // Slack webhook neumí přímo upload souboru, použijeme Slack API (files.upload)
  // Pro demo: pošleme pouze odkaz na PDF (v produkci použít Slack Bot Token a files.upload)
  const message = {
    text: 'Nový strategický dashboard ServisKol (PDF):',
    attachments: [
      {
        title: 'Stáhnout dashboard.pdf',
        title_link: 'https://github.com/PatrikLuks/serviskol/actions?query=workflow%3AStrategic+Dashboard',
        text: 'PDF je dostupné jako artefakt posledního běhu workflow.'
      }
    ]
  };
  try {
    await axios.post(SLACK_WEBHOOK_URL, message);
    console.log('Dashboard PDF bylo oznámeno na Slacku.');
  } catch (e) {
    console.error('Chyba při odesílání na Slack:', e.message);
    process.exit(1);
  }
}

sendDashboardToSlack();
