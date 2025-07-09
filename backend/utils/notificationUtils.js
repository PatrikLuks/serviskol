// Utility pro vytváření notifikací (volat např. při změně stavu servisu, věrnostních bodech apod.)
const Notification = require('../models/Notification');

// Utility pro alerty adminům (e-mail, push, log)
const User = require('../models/User');
const sendEmail = require('./sendEmail');
const { sendPushNotification } = require('./pushUtils');

async function createNotification({ user, type, message, channel = 'in-app' }) {
  return Notification.create({ user, type, message, channel });
}

async function alertAdmins({ subject, text, type = 'alert' }) {
  // Najdi adminy (role: 'admin')
  const admins = await User.find({ role: 'admin' });
  for (const admin of admins) {
    // E-mail
    if (admin.email) {
      await sendEmail({ to: admin.email, subject, text });
    }
    // Push notifikace
    await sendPushNotification(admin._id, subject, text);
    // Log (do audit.log)
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../logs/audit.log');
    fs.appendFileSync(logPath, JSON.stringify({ timestamp: new Date(), action: `ALERT: ${subject}`, detail: text, admin: admin.email }) + '\n');
  }
}

module.exports = { createNotification, alertAdmins };
