let client;
if (process.env.NODE_ENV === 'test') {
  // Mock PostHog klient pro testy
  client = { capture: () => {} };
} else if (process.env.POSTHOG_KEY) {
  const posthog = require('posthog-node');
  client = new posthog.PostHog(process.env.POSTHOG_KEY, { host: process.env.POSTHOG_HOST || 'https://app.posthog.com' });
} else {
  // Pokud není klíč, použij no-op klient
  client = { capture: () => {} };
}

// Logování klíčových backend akcí
function captureEvent(userId, event, properties = {}) {
  client.capture({
    distinctId: userId,
    event,
    properties,
  });
}

module.exports = { captureEvent };
