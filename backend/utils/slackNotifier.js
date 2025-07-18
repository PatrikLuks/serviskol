// utils/slackNotifier.js
// Odesílá zprávu na Slack webhook při incidentu nebo eskalaci

const fetch = require('node-fetch');


async function sendSlackNotification({ text }) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  } catch (e) {
    // ignore
  }
}

module.exports = { sendSlackNotification };
