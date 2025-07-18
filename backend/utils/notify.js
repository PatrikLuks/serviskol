const nodemailer = require('nodemailer');

// Odeslání e-mailu (prototyp, použijte SMTP v .env)
async function sendEmail({ to, subject, text, html, forceError }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@serviskol.cz',
    to,
    subject,
    text,
    html
  };
  // Pouze v testu umožni simulovat chybu
  if (process.env.NODE_ENV === 'test' && forceError) {
    mailOptions.forceError = true;
  }
  return await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
