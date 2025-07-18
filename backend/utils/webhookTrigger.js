// Spuštění webhooku na změnu AI segmentu
const axios = require('axios');

/**
 * Spustí webhook (lze předat string URL nebo objekt { url, event })
 * Vrací výsledek nebo vyhazuje výjimku při chybě.
 */
module.exports = async function triggerWebhook(webhook, payload) {
  let url, event;
  if (typeof webhook === 'string') {
    url = webhook;
    event = undefined;
  } else {
    url = webhook.url;
    event = webhook.event;
  }
  try {
    const res = await axios.post(url, {
      ...(event ? { event } : {}),
      data: payload,
      triggeredAt: new Date().toISOString()
    });
    return res;
  } catch (e) {
    // Log error, případně audit log
    throw e;
  }
};
