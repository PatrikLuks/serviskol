// backend/scripts/ai_team_knowledge_base_archive.js
// AI-driven archivace týmového knowledge base do S3 bucketu pro dlouhodobé zálohování
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const REPORTS_DIR = path.join(__dirname, '../reports');
const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.S3_REGION || 'eu-central-1';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
const S3_SECRET_KEY = process.env.S3_SECRET_KEY;

function getLatestReport(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return '';
  return {
    filename: files[files.length-1],
    content: fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8')
  };
}

async function archiveKnowledgeBase() {
  const report = getLatestReport('ai_team_knowledge_base_report-');
  if (!report || !report.content) throw new Error('Chybí týmový knowledge base report.');
  if (!S3_BUCKET || !S3_ACCESS_KEY || !S3_SECRET_KEY) throw new Error('Chybí S3 konfigurace.');
  const s3 = new AWS.S3({
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
    region: S3_REGION
  });
  await s3.putObject({
    Bucket: S3_BUCKET,
    Key: `archive/${report.filename}`,
    Body: report.content,
    ContentType: 'text/markdown'
  }).promise();
  console.log(`Knowledge base archivován do S3: archive/${report.filename}`);
}

if (require.main === module) {
  archiveKnowledgeBase().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { archiveKnowledgeBase };
