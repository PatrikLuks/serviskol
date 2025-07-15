const posthog = require('posthog-node');
const client = new posthog.PostHog(process.env.POSTHOG_KEY, { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' });

// Logování klíčových backend akcí
function captureEvent(userId, event, properties = {}) {
  client.capture({
    distinctId: userId,
    event,
    properties,
  });
}

module.exports = { captureEvent };
