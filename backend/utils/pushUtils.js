const admin = require('firebase-admin');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Inicializace FCM (použijte svůj serviceAccountKey.json)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)),
  });
}

async function sendPushNotification(userId, title, body) {
  const user = await User.findById(userId);
  if (!user || !user.pushToken || user.notificationChannel !== 'push') return;
  const message = {
    token: user.pushToken,
    notification: { title, body },
    data: { userId: String(userId) }
  };
  const logPath = path.join(__dirname, '../logs/push.log');
  try {
    await admin.messaging().send(message);
    fs.appendFileSync(logPath, `${new Date().toISOString()} PUSH OK ${user.email || userId} ${title}\n`);
  } catch (err) {
    fs.appendFileSync(logPath, `${new Date().toISOString()} PUSH FAIL ${user.email || userId} ${title} ${err.message}\n`);
    // fallback na e-mail
    if (user.email) {
      // Odeslat e-mail s předmětem title a textem body
      const sendEmail = require('./sendEmail');
      await sendEmail({
        to: user.email,
        subject: `[Fallback] ${title}`,
        text: body
      });
    }
  }
}

module.exports = { sendPushNotification };
