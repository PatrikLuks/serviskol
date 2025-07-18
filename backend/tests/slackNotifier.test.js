const { sendSlackNotification } = require('../utils/slackNotifier');

jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

const OLD_ENV = process.env;

describe('slackNotifier util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should not call fetch if SLACK_WEBHOOK_URL is not set', async () => {
    delete process.env.SLACK_WEBHOOK_URL;
    await sendSlackNotification({ text: 'incident' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should call fetch with correct params if SLACK_WEBHOOK_URL is set', async () => {
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx';
    fetch.mockResolvedValueOnce({ ok: true });
    await sendSlackNotification({ text: 'incident' });
    expect(fetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/xxx',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'incident' })
      })
    );
  });

  it('should ignore fetch errors', async () => {
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/xxx';
    fetch.mockRejectedValueOnce(new Error('fail'));
    await expect(sendSlackNotification({ text: 'err' })).resolves.toBeUndefined();
  });
});
