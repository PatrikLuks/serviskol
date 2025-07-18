  it('should send admin notification to multiple admins (email, push, log)', async () => {
    const User = require('../models/User');
    User.find.mockResolvedValueOnce([
      { _id: 'admin1', email: 'admin1@serviskol.cz', role: 'admin', notificationChannel: 'push', pushToken: 'token1' },
      { _id: 'admin2', email: 'admin2@serviskol.cz', role: 'admin', notificationChannel: 'push', pushToken: 'token2' }
    ]);
    await sendAdminNotification({ subject: 'Multi admin alert', text: 'Více adminů' });
    const sendEmail = require('../utils/sendEmail').sendEmail;
    expect(sendEmail).toHaveBeenCalledWith({ to: 'admin1@serviskol.cz', subject: 'Multi admin alert', text: 'Více adminů' });
    expect(sendEmail).toHaveBeenCalledWith({ to: 'admin2@serviskol.cz', subject: 'Multi admin alert', text: 'Více adminů' });
    expect(fs.existsSync(logPath)).toBe(true);
    const log = fs.readFileSync(logPath, 'utf-8');
    expect(log).toMatch(/ALERT: Multi admin alert/);
  });

  it('should send admin notification to admin without email (only push, log)', async () => {
    jest.clearAllMocks();
    const User = require('../models/User');
    User.find.mockResolvedValueOnce([
      { _id: 'admin3', role: 'admin', notificationChannel: 'push', pushToken: 'token3' }
    ]);
    await sendAdminNotification({ subject: 'No email admin', text: 'Pouze push' });
    const sendEmail = require('../utils/sendEmail').sendEmail;
    expect(sendEmail).not.toHaveBeenCalled();
    expect(fs.existsSync(logPath)).toBe(true);
    const log = fs.readFileSync(logPath, 'utf-8');
    expect(log).toMatch(/ALERT: No email admin/);
  });

  it('should send push notification (happy path)', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce({ _id: 'u', email: 'e@e.cz', notificationChannel: 'push', pushToken: 'tok' });
    const originalAppend = fs.appendFileSync;
    fs.appendFileSync = jest.fn();
    await sendPushNotification('u', 'Titulek', 'Tělo');
    expect(fs.appendFileSync).toHaveBeenCalled();
    fs.appendFileSync = originalAppend;
  });
const { sendUserNotification, sendAdminNotification, sendPushNotification } = require('../utils/notificationUtils');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');


jest.mock('../models/Notification', () => ({
  create: jest.fn().mockResolvedValue({ ok: true })
}));
jest.mock('../models/User', () => ({
  find: jest.fn().mockResolvedValue([{ _id: 'admin1', email: 'admin@serviskol.cz', role: 'admin', notificationChannel: 'push', pushToken: 'token1' }]),
  findById: jest.fn().mockImplementation(id => Promise.resolve({ _id: id, email: 'user@serviskol.cz', notificationChannel: 'push', pushToken: 'token2' }))
}));
jest.mock('../utils/sendEmail', () => ({ sendEmail: jest.fn() }));

const logPath = '/tmp/audit.log';

describe('notificationUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
  });

  it('should not send push notification if user not found', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce(null);
    await expect(sendPushNotification('notfound', 'T', 'B')).resolves.toBeUndefined();
  });

  it('should not send push notification if user has no pushToken', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce({ _id: 'u', notificationChannel: 'push' });
    await expect(sendPushNotification('u', 'T', 'B')).resolves.toBeUndefined();
  });

  it('should not send push notification if user notificationChannel is not push', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce({ _id: 'u', pushToken: 'tok', notificationChannel: 'email' });
    await expect(sendPushNotification('u', 'T', 'B')).resolves.toBeUndefined();
  });

  it('should handle error in push log and fallback to email (no user.email)', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce({ _id: 'u', pushToken: 'tok', notificationChannel: 'push' });
    const sendEmail = require('../utils/sendEmail').sendEmail;
    const originalAppend = fs.appendFileSync;
    fs.appendFileSync = jest.fn(() => { throw new Error('fail'); });
    await sendPushNotification('u', 'T', 'B');
    expect(sendEmail).not.toHaveBeenCalled();
    fs.appendFileSync = originalAppend;
  });

  it('should handle error in push log and fallback to email (with user.email)', async () => {
    const User = require('../models/User');
    User.findById.mockResolvedValueOnce({ _id: 'u', pushToken: 'tok', notificationChannel: 'push', email: 'e@e.cz' });
    const sendEmail = require('../utils/sendEmail').sendEmail;
    const originalAppend = fs.appendFileSync;
    fs.appendFileSync = jest.fn(() => { throw new Error('fail'); });
    await sendPushNotification('u', 'T', 'B');
    expect(sendEmail).toHaveBeenCalledWith({ to: 'e@e.cz', subject: '[Fallback] T', text: 'B' });
    fs.appendFileSync = originalAppend;
  });


  it('should send user notification', async () => {
    const res = await sendUserNotification({ userId: 'user1', type: 'info', message: 'Test zpráva' });
    const Notification = require('../models/Notification');
    expect(Notification.create).toHaveBeenCalledWith({ user: 'user1', type: 'info', message: 'Test zpráva', channel: 'in-app' });
    expect(res).toEqual({ ok: true });
  });


  it('should send admin notification (email, push, log)', async () => {
    await sendAdminNotification({ subject: 'Test alert', text: 'Testovací text' });
    const sendEmail = require('../utils/sendEmail').sendEmail;
    expect(sendEmail).toHaveBeenCalledWith({ to: 'admin@serviskol.cz', subject: 'Test alert', text: 'Testovací text' });
    expect(fs.existsSync(logPath)).toBe(true);
    const log = fs.readFileSync(logPath, 'utf-8');
    expect(log).toMatch(/ALERT: Test alert/);
  });
  it('should send push notification and fallback to email', async () => {
    // Mock fs.appendFileSync tak, aby vyhodil chybu při pokusu o zápis push logu
    const originalAppend = fs.appendFileSync;
    fs.appendFileSync = jest.fn(() => { throw new Error('Simulated push fail'); });
    try {
      await sendPushNotification('user1', 'Push titulek', 'Push tělo');
    } catch (e) {
      // očekávaná simulovaná chyba
    }
    const sendEmail = require('../utils/sendEmail').sendEmail;
    expect(sendEmail).toHaveBeenCalledWith({ to: 'user@serviskol.cz', subject: '[Fallback] Push titulek', text: 'Push tělo' });
    fs.appendFileSync = originalAppend; // Obnovit původní implementaci
  });
});
