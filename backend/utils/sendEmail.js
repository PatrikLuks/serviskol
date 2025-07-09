const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'demo@ethereal.email',
    pass: process.env.SMTP_PASS || 'demo'
  }
});

async function sendEmail({ to, subject, text }) {
  return transporter.sendMail({
    from: 'serviskol@demo.cz',
    to,
    subject,
    text
  });
}

module.exports = sendEmail;
