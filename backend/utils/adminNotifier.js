// Utilita pro odeslání e-mailu adminovi (nodemailer)
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = process.env.SMTP_PORT || 25;
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
});

async function notifyAdmin(subject, text) {
  await transporter.sendMail({
    from: 'serviskol@notifikace.cz',
    to: ADMIN_EMAIL,
    subject,
    text
  });
}

module.exports = notifyAdmin;
