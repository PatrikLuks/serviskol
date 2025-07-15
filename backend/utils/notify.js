const nodemailer = require('nodemailer');

// Odeslání e-mailu (prototyp, použijte SMTP v .env)
async function sendEmail({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@serviskol.cz',
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendEmail };
