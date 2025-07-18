// Utility pro vytváření notifikací (volat např. při změně stavu servisu, věrnostních bodech apod.)

/**
 * @module notificationUtils
 * API: sendUserNotification, sendAdminNotification, sendPushNotification
 */

const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('./sendEmail').sendEmail;
const fs = require('fs');
const path = require('path');

// Push notification utilita (fallback na e-mail)
async function sendPushNotification(userId, title, body) {
  const user = await User.findById(userId);
  if (!user || !user.pushToken || user.notificationChannel !== 'push') return;
  try {
    // Zde by byla logika pro FCM/Firebase push
    // await admin.messaging().send(...)
    fs.appendFileSync(path.join(__dirname, '../logs/push.log'), `${new Date().toISOString()} PUSH OK ${user.email || userId} ${title}\n`);
  } catch (err) {
    try {
      fs.appendFileSync(path.join(__dirname, '../logs/push.log'), `${new Date().toISOString()} PUSH FAIL ${user.email || userId} ${title} ${err.message}\n`);
    } catch {}
    if (user.email) {
      await sendEmail({ to: user.email, subject: `[Fallback] ${title}`, text: body });
    }
  }
}

// In-app notifikace pro uživatele
async function sendUserNotification({ userId, type, message, channel = 'in-app' }) {
  return Notification.create({ user: userId, type, message, channel });
}

// Notifikace všem adminům (e-mail, push, log)
async function sendAdminNotification({ subject, text }) {
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    if (admin.email) {
      await sendEmail({ to: admin.email, subject, text });
    }
    await sendPushNotification(admin._id, subject, text);
    fs.appendFileSync('/tmp/audit.log', JSON.stringify({ timestamp: new Date(), action: `ALERT: ${subject}`, detail: text, admin: admin.email }) + '\n');
  }
}

module.exports = { sendUserNotification, sendAdminNotification, sendPushNotification };
