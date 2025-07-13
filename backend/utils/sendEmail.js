const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'demo@ethereal.email',
    pass: process.env.SMTP_PASS || 'demo'
  }
});


/**
 * Odeslání e-mailu, volitelně s přílohami
 * @param {Object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.text
 * @param {Array} [opts.attachments] - [{ filename, content }]
 */
async function sendEmail({ to, subject, text, attachments }) {
  return transporter.sendMail({
    from: 'serviskol@demo.cz',
    to,
    subject,
    text,
    attachments
  });
}

module.exports = sendEmail;
