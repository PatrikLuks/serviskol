// Automatizované generování a ukládání incident & trend reportu
const { generateReport } = require('./incident_trend_report');
const fs = require('fs');
const path = require('path');

const now = new Date();
const ymd = now.toISOString().slice(0, 10);
const reportsDir = path.join(__dirname, '../reports');
const latestPath = path.join(reportsDir, 'incident_report-latest.md');
const datedPath = path.join(reportsDir, `incident_report-${ymd}.md`);

const report = generateReport();
fs.writeFileSync(latestPath, report);
fs.writeFileSync(datedPath, report);
console.log(`Incident report uložen do:\n- ${latestPath}\n- ${datedPath}`);
