// send-compliance-report-email.js
// Automatizované rozeslání a archivace compliance reportu (GDPR/ISO)

const nodemailer = require('nodemailer');
const generateComplianceReport = require('./ai-compliance-report');
const markdownpdf = require('markdown-pdf');
const AWS = require('aws-sdk');
const AuditLog = require('../models/AuditLog');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_TO = process.env.COMPLIANCE_RECIPIENTS; // čárkou oddělené emaily
const S3_BUCKET = process.env.COMPLIANCE_REPORT_S3_BUCKET;
const S3_REGION = process.env.COMPLIANCE_REPORT_S3_REGION || 'eu-central-1';
const S3_PREFIX = process.env.COMPLIANCE_REPORT_S3_PREFIX || 'compliance-reports/';

AWS.config.update({ region: S3_REGION });
const s3 = new AWS.S3();

async function sendComplianceReportEmail() {
  const md = await generateComplianceReport();
  // PDF generace
  const pdfBuffer = await new Promise((resolve, reject) => {
    markdownpdf().from.string(md).to.buffer((err, buffer) => {
      if (err) reject(err); else resolve(buffer);
    });
  });
  // Archivace do S3
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `${S3_PREFIX}compliance-report-${timestamp}.pdf`;
  await s3.putObject({
    Bucket: S3_BUCKET,
    Key: key,
    Body: pdfBuffer,
    ContentType: 'application/pdf',
    ACL: 'private',
  }).promise();
  // Email
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject: 'Compliance Report (GDPR / ISO 27001)',
    text: md,
    attachments: [
      { filename: 'compliance-report.pdf', content: pdfBuffer, contentType: 'application/pdf' },
      { filename: 'compliance-report.md', content: md, contentType: 'text/markdown' }
    ]
  });
  // Audit log
  await AuditLog.create({
    type: 'compliance-report-email',
    action: 'Odeslán compliance report emailem a archivován do S3',
    details: { to: EMAIL_TO, messageId: info.messageId, s3: `s3://${S3_BUCKET}/${key}` },
    createdAt: new Date()
  });
  console.log('Compliance report sent:', info.messageId, 'archived:', key);
}

if (require.main === module) {
  require('../config/db')().then(async () => {
    await sendComplianceReportEmail();
    process.exit(0);
  });
}

module.exports = sendComplianceReportEmail;
