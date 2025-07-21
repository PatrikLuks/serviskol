// Skript pro odeslání SMS při kritickém alertu pomocí Twilio
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const toNumber = process.env.CRITICAL_ALERT_PHONE;

if (!accountSid || !authToken || !fromNumber || !toNumber) {
  console.error('Chybí Twilio credentials nebo cílové číslo.');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

const message = process.argv[2] || 'Kritický alert: Opakované selhání exportů v Serviskol! Okamžitě zkontrolujte systém.';

client.messages.create({
  body: message,
  from: fromNumber,
  to: toNumber
}).then(msg => {
  console.log('SMS odeslána:', msg.sid);
}).catch(err => {
  console.error('Chyba při odesílání SMS:', err);
});
