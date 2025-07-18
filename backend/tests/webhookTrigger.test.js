
const triggerWebhook = require('../utils/webhookTrigger');
const axios = require('axios');

jest.mock('axios');

describe('webhookTrigger util', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it('should trigger webhook successfully (string URL)', async () => {
    axios.post.mockResolvedValueOnce({ ok: true, status: 200 });
    const result = await triggerWebhook('https://example.com/webhook', { foo: 'bar' });
    expect(result).toEqual({ ok: true, status: 200 });
    expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', expect.objectContaining({ data: { foo: 'bar' } }));
  });

  it('should trigger webhook with event (object)', async () => {
    axios.post.mockResolvedValueOnce({ ok: true, status: 201 });
    const result = await triggerWebhook({ url: 'https://example.com/webhook', event: 'ai_segment_change' }, { bar: 2 });
    expect(result.status).toBe(201);
    expect(axios.post).toHaveBeenCalledWith('https://example.com/webhook', expect.objectContaining({ event: 'ai_segment_change', data: { bar: 2 } }));
  });

  it('should throw on network error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(triggerWebhook('https://example.com/webhook', { foo: 'bar' })).rejects.toThrow('Network error');
  });

  it('should include triggeredAt timestamp', async () => {
    axios.post.mockResolvedValueOnce({ ok: true, status: 200 });
    await triggerWebhook('https://example.com/webhook', { foo: 1 });
    const call = axios.post.mock.calls[0][1];
    expect(call.triggeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
