const https = require('https');

const slackWebhook = process.env.SLACK_WEBHOOK_URL;

function sendSlackNotification(text) {
  if (!slackWebhook) return;
  const data = JSON.stringify({ text });
  const url = new URL(slackWebhook);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  const req = https.request(options, res => {
    res.on('data', () => {});
  });
  req.on('error', error => {
    console.error('Chyba při odesílání Slack notifikace:', error);
  });
  req.write(data);
  req.end();
}
const nodemailer = require('nodemailer');

// Konfigurace emailu
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password'
  }
});

const notifyEmail = process.env.NOTIFY_EMAIL || 'admin@example.com';

function sendErrorEmail(subject, text) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@example.com',
    to: notifyEmail,
    subject,
    text
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Chyba při odesílání emailu:', error);
    } else {
      console.log('Notifikační email odeslán:', info.response);
    }
  });
}
// Export reportu a grafu do AWS S3
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

// Nastavení AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-central-1'
});

const reportsDir = path.join(__dirname, '../reports');
const filesToUpload = [
  path.join(reportsDir, `retrospektiva-${new Date().toISOString().slice(0,10)}.txt`),
  path.join(reportsDir, `retrospektiva-chart-${new Date().toISOString().slice(0,10)}.png`)
];

const bucketName = process.env.AWS_S3_BUCKET || 'serviskol-reports';

const logPath = path.join(__dirname, '../reports/export.log');
function logExport(message) {
  fs.appendFileSync(logPath, `${new Date().toISOString()} ${message}\n`);
}

filesToUpload.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath);
    const params = {
      Bucket: bucketName,
      Key: path.basename(filePath),
      Body: fileContent
    };
    s3.upload(params, (err, data) => {
      if (err) {
        const msg = `Chyba při uploadu ${filePath}: ${err.message}`;
        console.error(msg);
        logExport(msg);
        sendErrorEmail('Selhání exportu reportu na S3', msg);
        sendSlackNotification(`❌ Selhání exportu reportu na S3: ${msg}`);
      } else {
        const msg = `Soubor ${filePath} úspěšně nahrán na S3: ${data.Location}`;
        console.log(msg);
        logExport(msg);
      }
    });
  } else {
    const msg = `Soubor ${filePath} neexistuje.`;
    console.warn(msg);
    logExport(msg);
  }
});
