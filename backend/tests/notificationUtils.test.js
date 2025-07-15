const { createNotification, alertAdmins } = require('../utils/notificationUtils');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

jest.mock('../models/Notification');
jest.mock('../models/User');
jest.mock('../utils/sendEmail', () => jest.fn());
jest.mock('../utils/pushUtils', () => ({ sendPushNotification: jest.fn() }));

const logPath = '/tmp/audit.log';

describe('notificationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
  });

  it('should create a notification', async () => {
    Notification.create.mockResolvedValue({ id: 'notif1' });
    const res = await createNotification({ user: 'u1', type: 'info', message: 'msg' });
    expect(Notification.create).toHaveBeenCalledWith({ user: 'u1', type: 'info', message: 'msg', channel: 'in-app' });
    expect(res).toEqual({ id: 'notif1' });
  });

  it('should alert all admins via email, push and log', async () => {
    User.find.mockResolvedValue([
      { _id: 'a1', email: 'admin1@example.com', pushToken: 'pt1', notificationChannel: 'push' },
      { _id: 'a2', email: 'admin2@example.com', pushToken: null, notificationChannel: 'in-app' }
    ]);
    const sendEmail = require('../utils/sendEmail');
    const { sendPushNotification } = require('../utils/pushUtils');
    await alertAdmins({ subject: 'Test', text: 'Alert text' });
    expect(sendEmail).toHaveBeenCalledWith({ to: 'admin1@example.com', subject: 'Test', text: 'Alert text' });
    expect(sendEmail).toHaveBeenCalledWith({ to: 'admin2@example.com', subject: 'Test', text: 'Alert text' });
    expect(sendPushNotification).toHaveBeenCalledWith('a1', 'Test', 'Alert text');
    expect(sendPushNotification).toHaveBeenCalledWith('a2', 'Test', 'Alert text');
    expect(fs.existsSync(logPath)).toBe(true);
    const log = fs.readFileSync(logPath, 'utf-8');
    expect(log).toMatch(/ALERT: Test/);
  });
});
