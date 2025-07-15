// backend/scripts/archive_onboarding_report.js
// Archivace onboarding reportu do S3 a rozeslání e-mailem managementu

const fs = require('fs');
const path = require('path');
// Simulace S3 a emailu

function archiveReport() {
  const reportPath = path.join(__dirname, '../reports/onboarding_report-latest.md');
  if (!fs.existsSync(reportPath)) {
    throw new Error('Report neexistuje');
  }
  const reportContent = fs.readFileSync(reportPath, 'utf-8');

  // Simulace uploadu do S3
  // V reálném nasazení použít AWS SDK
  fs.writeFileSync(path.join(__dirname, '../backups/onboarding_report-' + Date.now() + '.md'), reportContent);

  // Simulace odeslání e-mailem
  // V reálném nasazení použít nodemailer
  const emailLogPath = path.join(__dirname, '../logs/onboarding_report_email.log');
  fs.appendFileSync(emailLogPath, `[${new Date().toISOString()}] Report odeslán managementu\n`);

  return { success: true, message: 'Report archivován a odeslán managementu (simulace)' };
}

module.exports = { archiveReport };
