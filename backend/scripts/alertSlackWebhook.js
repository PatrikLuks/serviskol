// Odeslání alertu na Slack/webhook kanál při bezpečnostním incidentu nebo nálezu
// Používá se jako součást multi-channel alertingu

const https = require('https');
const url = require('url');

const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const MESSAGE = process.argv[2] || 'Byl detekován bezpečnostní incident v systému ServisKol.';

function sendSlackAlert(message) {
  if (!WEBHOOK_URL) {
    console.error('Chybí SLACK_WEBHOOK_URL v prostředí.');
    process.exit(1);
  }
  const data = JSON.stringify({ text: message });
  const webhookUrl = url.parse(WEBHOOK_URL);
  const options = {
    hostname: webhookUrl.hostname,
    path: webhookUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  const req = https.request(options, res => {
    if (res.statusCode === 200) {
      console.log('Alert odeslán na Slack/webhook.');
    } else {
      console.error('Chyba při odesílání alertu:', res.statusCode);
    }
  });
  req.on('error', error => {
    console.error('Chyba při odesílání alertu:', error);
  });
  req.write(data);
  req.end();
}

if (require.main === module) {
  sendSlackAlert(MESSAGE);
}
