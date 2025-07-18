const notifyAdmin = require('../utils/adminNotifier');

jest.mock('../utils/notify', () => ({
  sendEmail: jest.fn().mockResolvedValue({ accepted: ['admin@serviskol.cz'] })
}));

describe('adminNotifier util', () => {
  it('should notify admin via email', async () => {
    const result = await notifyAdmin('Test subject', 'Test message');
    expect(result.accepted).toContain('admin@serviskol.cz');
  });

  it('should throw if sendEmail fails', async () => {
    const { sendEmail } = require('../utils/notify');
    sendEmail.mockRejectedValueOnce(new Error('SMTP error'));
    await expect(notifyAdmin('Test subject', 'Test message')).rejects.toThrow('SMTP error');
  });
});
