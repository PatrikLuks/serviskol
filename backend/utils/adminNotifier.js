// Utilita pro odeslání e-mailu adminovi přes interní notify utilitu
const { sendEmail } = require('./notify');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@serviskol.cz';

async function notifyAdmin(subject, text) {
  return await sendEmail({
    to: ADMIN_EMAIL,
    subject,
    text
  });
}

module.exports = notifyAdmin;
