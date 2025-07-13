// Spuštění webhooku na změnu AI segmentu
const axios = require('axios');

module.exports = async function triggerWebhook(webhook, payload) {
  try {
    await axios.post(webhook.url, {
      event: webhook.event,
      data: payload,
      triggeredAt: new Date().toISOString()
    });
  } catch (e) {
    // Log error, případně audit log
  }
};
