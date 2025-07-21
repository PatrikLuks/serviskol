// Skript pro automatické vytvoření incidentu v ServiceNow při kritickém selhání exportu
const https = require('https');

const servicenowInstance = process.env.SERVICENOW_INSTANCE; // např. 'dev12345.service-now.com'
const servicenowUser = process.env.SERVICENOW_USER;
const servicenowPass = process.env.SERVICENOW_PASS;
const incidentShortDescription = process.argv[2] || 'Kritický alert: Opakované selhání exportů v Serviskol';
const incidentDescription = process.argv[3] || 'Systém detekoval opakované selhání exportů. Doporučujeme okamžitou kontrolu a eskalaci.';

if (!servicenowInstance || !servicenowUser || !servicenowPass) {
  console.error('Chybí ServiceNow credentials nebo instance.');
  process.exit(1);
}

const data = JSON.stringify({
  short_description: incidentShortDescription,
  description: incidentDescription,
  urgency: 1,
  impact: 1,
  category: 'Export',
  assignment_group: 'IT Support'
});

const options = {
  hostname: servicenowInstance,
  path: '/api/now/table/incident',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Basic ' + Buffer.from(servicenowUser + ':' + servicenowPass).toString('base64')
  }
};

const req = https.request(options, res => {
  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    if (res.statusCode === 201) {
      console.log('Incident v ServiceNow úspěšně vytvořen:', body);
    } else {
      console.error('Chyba při vytváření incidentu:', res.statusCode, body);
    }
  });
});

req.on('error', error => {
  console.error('Chyba při komunikaci se ServiceNow:', error);
});

req.write(data);
req.end();
