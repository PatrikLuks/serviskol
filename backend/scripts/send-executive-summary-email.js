// send-executive-summary-email.js
// Automatizované rozeslání executive summary reportu emailem managementu

const nodemailer = require('nodemailer');
const generateExecutiveSummary = require('./ai-executive-summary');
const AuditLog = require('../models/AuditLog');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_TO = process.env.EXEC_SUMMARY_RECIPIENTS; // čárkou oddělené emaily

async function sendExecutiveSummaryEmail() {
  const summary = await generateExecutiveSummary();
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: 'AI Executive Summary Report',
    text: summary,
    html: `<pre style="font-family:monospace">${summary.replace(/</g, '&lt;')}</pre>`
  });
  // Audit log
  await AuditLog.create({
    type: 'executive-summary-email',
    action: 'Odeslán executive summary report emailem',
    details: { to: EMAIL_TO, messageId: info.messageId },
    createdAt: new Date()
  });
  console.log('Executive summary report sent:', info.messageId);
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    await sendExecutiveSummaryEmail();
    process.exit(0);
  });
}

module.exports = sendExecutiveSummaryEmail;
