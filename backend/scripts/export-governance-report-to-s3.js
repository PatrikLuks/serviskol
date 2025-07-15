// export-governance-report-to-s3.js
// Automatizovaný export governance reportu do S3 bucketu

const AWS = require('aws-sdk');
const generateGovernanceReport = require('./ai-governance-report');

const S3_BUCKET = process.env.GOVERNANCE_REPORT_S3_BUCKET;
const S3_REGION = process.env.GOVERNANCE_REPORT_S3_REGION || 'eu-central-1';
const S3_PREFIX = process.env.GOVERNANCE_REPORT_S3_PREFIX || 'governance-reports/';

AWS.config.update({ region: S3_REGION });
const s3 = new AWS.S3();

async function exportReportToS3() {
  const report = await generateGovernanceReport();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const key = `${S3_PREFIX}governance-report-${timestamp}.json`;
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: JSON.stringify(report, null, 2),
    ContentType: 'application/json',
    ACL: 'private',
  };
  await s3.putObject(params).promise();
  console.log(`Report uploaded to s3://${S3_BUCKET}/${key}`);
}

if (require.main === module) {
  exportReportToS3().catch(e => {
    console.error('Export failed:', e);
    process.exit(1);
  });
}

module.exports = exportReportToS3;
