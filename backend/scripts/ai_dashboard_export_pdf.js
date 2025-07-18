// Skript: ai_dashboard_export_pdf.js
// Popis: Vygeneruje PDF z dashboard.html pomocí Puppeteer.

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DASHBOARD_HTML = path.join(__dirname, '../reports/dashboard.html');
const DASHBOARD_PDF = path.join(__dirname, '../reports/dashboard.pdf');

async function exportDashboardToPDF() {
  if (!fs.existsSync(DASHBOARD_HTML)) {
    console.error('Dashboard HTML neexistuje:', DASHBOARD_HTML);
    process.exit(1);
  }
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('file://' + DASHBOARD_HTML, { waitUntil: 'networkidle0' });
  await page.pdf({ path: DASHBOARD_PDF, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Dashboard PDF vygenerován:', DASHBOARD_PDF);
}

exportDashboardToPDF();
