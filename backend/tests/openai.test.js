const { generateFollowupMessage, generateFollowupSummary } = require('../utils/openai');
const axios = require('axios');

jest.mock('axios');

const OLD_ENV = process.env;

describe('openai util', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, OPENAI_API_KEY: 'test-key' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should throw if OPENAI_API_KEY is not set', async () => {
    process.env.OPENAI_API_KEY = '';
    await expect(generateFollowupMessage({ segment: {}, ctr: 0.1, days: 7 })).rejects.toThrow();
    await expect(generateFollowupSummary({ segment: {}, ctr: 0.1, days: 7 })).rejects.toThrow();
  });

  it('should call axios.post with correct params for message', async () => {
    axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Zpráva' } }] } });
    const res = await generateFollowupMessage({ segment: { role: 'client' }, ctr: 0.12, days: 5 });
    expect(res).toBe('Zpráva');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('openai.com'),
      expect.objectContaining({ model: 'gpt-3.5-turbo' }),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringContaining('test-key') }) })
    );
  });

  it('should call axios.post with correct params for summary', async () => {
    axios.post.mockResolvedValueOnce({ data: { choices: [{ message: { content: 'Shrnutí' } }] } });
    const res = await generateFollowupSummary({ segment: { region: 'Praha' }, ctr: 0.05, days: 10 });
    expect(res).toBe('Shrnutí');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('openai.com'),
      expect.objectContaining({ model: 'gpt-3.5-turbo' }),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: expect.stringContaining('test-key') }) })
    );
  });

  it('should propagate axios errors', async () => {
    axios.post.mockRejectedValueOnce(new Error('fail'));
    await expect(generateFollowupMessage({ segment: {}, ctr: 0.1, days: 7 })).rejects.toThrow('fail');
  });
});
