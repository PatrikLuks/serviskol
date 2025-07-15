// AI generátor dokumentace z kódu (OpenAI GPT-4o)
// Usage: node scripts/generate-docs-ai.js <OPENAI_API_KEY>

const fs = require('fs');
const path = require('path');
const https = require('https');

const OPENAI_API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key!');
  process.exit(1);
}

// Najdi všechny modely a controllery v backendu
function getFiles(dir, exts = ['.js'], files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && !f.startsWith('.')) getFiles(p, exts, files);
    else if (exts.includes(path.extname(f))) files.push(p);
  }
  return files;
}

// Vygeneruj dokumentaci pro jeden soubor
function generateDocAI(filename, code, cb) {
  const prompt = `Vygeneruj nebo aktualizuj dokumentaci (README sekci nebo docstringy) pro následující kód. Piš česky, přehledně, s příklady použití.\n\nSoubor: ${filename}\n\n${code}`;
  const data = JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi zkušený dokumentátor a vývojář. Piš česky, přehledně, s příklady.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 800
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
        const doc = json.choices[0].message.content.trim();
        cb(null, doc);
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
  const files = [
    ...getFiles('backend/models'),
    ...getFiles('backend/controllers')
  ];
  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    console.log(`\n=== ${file} ===`);
    await new Promise((resolve, reject) => {
      generateDocAI(file, code, (err, doc) => {
        if (err) {
          console.error('AI error:', err);
          return resolve();
        }
        const docFile = file + '.AI_DOC.md';
        fs.writeFileSync(docFile, doc);
        console.log(`Dokumentace uložena do ${docFile}`);
        resolve();
      });
    });
  }
})();
