const { sendPushNotification } = require('../utils/pushUtils');
const User = require('../models/User');
const admin = require('firebase-admin');
const fs = require('fs');
jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});

jest.mock('../models/User');
jest.mock('../utils/sendEmail', () => jest.fn());
jest.mock('firebase-admin', () => ({ messaging: () => ({ send: jest.fn() }) }));

// logPath už není potřeba, vše je mockováno

describe('pushUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do nothing if user not found or no pushToken', async () => {
    User.findById.mockResolvedValue(null);
    await sendPushNotification('u1', 'T', 'B');
    User.findById.mockResolvedValue({ _id: 'u2', pushToken: null, notificationChannel: 'push' });
    await sendPushNotification('u2', 'T', 'B');
    // No log, no error
  });

  it('should send push and log success', async () => {
    User.findById.mockResolvedValue({ _id: 'u3', pushToken: 'pt', notificationChannel: 'push', email: 'e@e.cz' });
    const send = jest.fn().mockResolvedValue('ok');
    admin.messaging = () => ({ send });
    await sendPushNotification('u3', 'T', 'B');
    expect(send).toHaveBeenCalled();
    expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('PUSH OK'));
  });

  it('should fallback to email and log fail if push fails', async () => {
    User.findById.mockResolvedValue({ _id: 'u4', pushToken: 'pt', notificationChannel: 'push', email: 'e2@e.cz' });
    const send = jest.fn().mockRejectedValue(new Error('fail'));
    admin.messaging = () => ({ send });
    const sendEmail = require('../utils/sendEmail');
    await sendPushNotification('u4', 'T', 'B');
    expect(send).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalledWith({ to: 'e2@e.cz', subject: '[Fallback] T', text: 'B' });
    expect(fs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('PUSH FAIL'));
  });
});
