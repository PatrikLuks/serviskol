// utils/slackNotifier.js
// Odesílá zprávu na Slack webhook při incidentu nebo eskalaci

const fetch = require('node-fetch');
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function sendSlackNotification({ text }) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  } catch (e) {
    // ignore
  }
}

module.exports = { sendSlackNotification };
