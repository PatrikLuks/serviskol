// Utility pro vytváření notifikací (volat např. při změně stavu servisu, věrnostních bodech apod.)
const Notification = require('../models/Notification');

async function createNotification({ user, type, message, channel = 'in-app' }) {
  return Notification.create({ user, type, message, channel });
}

module.exports = { createNotification };
