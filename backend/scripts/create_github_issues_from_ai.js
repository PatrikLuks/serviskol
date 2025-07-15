// Automatizované vytváření GitHub Issues z AI insightu a lessons learned
const fs = require('fs');
const path = require('path');
const https = require('https');

const OWNER = 'PatrikLuks';
const REPO = 'serviskol';
const TOKEN = process.env.GITHUB_TOKEN;
const REPORTS_DIR = path.join(__dirname, '../reports');

function extractRecommendations(text) {
  // Extrahuje odrážky začínající "- " nebo číslované
  return text.split('\n').filter(l => l.match(/^[-*] |^\d+\./)).map(l => l.replace(/^[-*] |^\d+\.\s*/, '').trim()).filter(Boolean);
}

function getLatestFile(prefix) {
  const files = fs.readdirSync(REPORTS_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .sort();
  if (!files.length) return null;
  return fs.readFileSync(path.join(REPORTS_DIR, files[files.length-1]), 'utf-8');
}

async function createIssue(title, body, labels=[]) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ title, body, labels });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/issues`,
      method: 'POST',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'serviskol-ai-bot',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(body));
        else reject(new Error(`GitHub API: ${res.statusCode} ${body}`));
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getOpenIssues() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/issues?state=open&per_page=100`,
      method: 'GET',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent': 'serviskol-ai-bot',
        'Accept': 'application/vnd.github+json'
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(JSON.parse(body));
        else reject(new Error(`GitHub API: ${res.statusCode} ${body}`));
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  if (!TOKEN) throw new Error('GITHUB_TOKEN není nastaven');
  const aiInsight = getLatestFile('ai_insight-') || '';
  const retro = getLatestFile('retrospective-') || '';
  const aiRecs = extractRecommendations(aiInsight);
  const retroRecs = extractRecommendations(retro);
  const allRecs = [...aiRecs, ...retroRecs];
  if (!allRecs.length) throw new Error('Žádná doporučení k vytvoření Issues');
  const openIssues = await getOpenIssues();
  for (const rec of allRecs) {
    if (openIssues.some(i => i.title.trim().toLowerCase() === rec.toLowerCase())) continue;
    try {
      await createIssue(rec, 'Automaticky vytvořeno z AI insightu/retrospektivy.', ['ai-recommendation', 'retrospective']);
      console.log(`Vytvořeno Issue: ${rec}`);
    } catch (e) {
      console.error(`Chyba při vytváření Issue '${rec}':`, e.message);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { main };
