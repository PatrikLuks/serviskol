const { sendEmail } = require('../utils/notify');

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => {
    const sendMail = jest.fn((opts, cb) => {
      // Pokud je v opts.forceError, simuluj chybu
      if (opts && opts.forceError) {
        if (cb) return cb(new Error('SMTP error'));
        return Promise.reject(new Error('SMTP error'));
      }
      if (cb) return cb(null, { accepted: [opts.to] });
      return Promise.resolve({ accepted: [opts.to] });
    });
    return { sendMail };
  })
}));

describe('notify util', () => {
  it('should send email successfully', async () => {
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', text: 'Hello' });
    expect(result.accepted).toContain('test@example.com');
  });

  it('should fail with SMTP error', async () => {
    await expect(sendEmail({ to: 'fail@example.com', subject: 'Test', text: 'Hello', forceError: true })).rejects.toThrow('SMTP error');
  });

  it('should pass forceError to sendMail in test env (by error thrown)', async () => {
    process.env.NODE_ENV = 'test';
    await expect(sendEmail({ to: 'force@example.com', subject: 'Test', text: 'Hello', forceError: true })).rejects.toThrow('SMTP error');
    process.env.NODE_ENV = '';
  });

  it('should send correct params to sendMail', async () => {
    // zachytíme poslední volání sendMail v mocku
    let lastOpts = null;
    jest.resetModules();
    jest.doMock('nodemailer', () => ({
      createTransport: jest.fn(() => ({
        sendMail: jest.fn((opts, cb) => {
          lastOpts = opts;
          if (cb) return cb(null, { accepted: [opts.to] });
          return Promise.resolve({ accepted: [opts.to] });
        })
      }))
    }));
    const { sendEmail } = require('../utils/notify');
    await sendEmail({ to: 'params@example.com', subject: 'Sub', text: 'Body', html: '<b>Body</b>' });
    expect(lastOpts).toEqual(expect.objectContaining({
      to: 'params@example.com',
      subject: 'Sub',
      text: 'Body',
      html: '<b>Body</b>'
    }));
    jest.dontMock('nodemailer');
  });
});
