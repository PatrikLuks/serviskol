// AI generátor migrací databáze (OpenAI GPT-4o)
// Usage: node scripts/generate-migration-ai.js <OPENAI_API_KEY>

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const OPENAI_API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key!');
  process.exit(1);
}

// Získej diff modelů oproti poslednímu commitu
function getModelsDiff() {
  try {
    return execSync('git diff HEAD~1 -- backend/models').toString();
  } catch {
    return '';
  }
}

function generateMigrationAI(diff, cb) {
  const prompt = `Na základě tohoto diffu modelů v Node.js projektu navrhni migraci databáze (SQL nebo MongoDB). Piš pouze kód migrace a krátký komentář.\n\n${diff}`;
  const data = JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi zkušený backend vývojář a DBA. Piš česky, přehledně, pouze kód migrace a komentář.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 600
  });
  const req = https.request({
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(body);
        const migration = json.choices[0].message.content.trim();
        cb(null, migration);
      } catch (e) {
        cb(e);
      }
    });
  });
  req.on('error', cb);
  req.write(data);
  req.end();
}

(async () => {
  const diff = getModelsDiff();
  if (!diff) {
    console.log('Žádné změny v modelech od posledního commitu.');
    process.exit(0);
  }
  generateMigrationAI(diff, (err, migration) => {
    if (err) {
      console.error('AI error:', err);
      process.exit(1);
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const file = path.join('migrations', `migration_${ts}.js`);
    fs.writeFileSync(file, migration);
    console.log(`Migrace uložena do ${file}`);
  });
})();
