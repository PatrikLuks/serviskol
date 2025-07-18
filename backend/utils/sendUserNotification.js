const sendEmail = require('./sendEmail');

/**
 * Odeslání notifikace uživateli podle preferovaného kanálu a engagementu
 * @param {Object} user - uživatelský objekt (musí obsahovat email, pushToken, preferredChannel, channelEngagement)
 * @param {string} subject - předmět zprávy
 * @param {string} message - text zprávy
 * @returns {Promise<{channel: string, success: boolean, error?: any}>}
 */
async function sendUserNotification(user, subject, message) {
  // Rozhodovací strom podle engagementu a preferencí
  let channel = 'in-app';
  if (typeof user.decisionTreeChannel === 'function') {
    channel = user.decisionTreeChannel(user).channel;
  } else if (user.preferredChannel) {
    channel = user.preferredChannel;
  }

  if (channel === 'email' && user.email) {
    try {
      await sendEmail({
        to: user.email,
        subject,
        text: message
      });
      return { channel: 'email', success: true };
    } catch (e) {
      return { channel: 'email', success: false, error: e };
    }
  }
  if (channel === 'in-app' && user._id) {
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: user._id,
        type: 'system',
        message,
        channel: 'in-app',
        createdAt: new Date()
      });
      return { channel: 'in-app', success: true };
    } catch (e) {
      return { channel: 'in-app', success: false, error: e };
    }
  }
  if (channel === 'push' && user.pushToken) {
    try {
      const sendPushNotification = require('./sendPushNotification');
      const result = await sendPushNotification(user.pushToken, subject, message);
      return { channel: 'push', success: result.success, error: result.error };
    } catch (e) {
      return { channel: 'push', success: false, error: e };
    }
  }
  // TODO: sms
  return { channel, success: false, error: 'Notifikační kanál není implementován.' };
}

module.exports = sendUserNotification;
