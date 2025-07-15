// AI generátor OpenAPI/Swagger dokumentace (OpenAI GPT-4o)
// Usage: node scripts/generate-openapi-ai.js <OPENAI_API_KEY>

const fs = require('fs');
const path = require('path');
const https = require('https');

const OPENAI_API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key!');
  process.exit(1);
}

function getFiles(dir, exts = ['.js'], files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && !f.startsWith('.')) getFiles(p, exts, files);
    else if (exts.includes(path.extname(f))) files.push(p);
  }
  return files;
}

function generateOpenAPIAI(code, cb) {
  const prompt = `Na základě tohoto Node.js/Express kódu vygeneruj OpenAPI 3.0 (Swagger) specifikaci všech endpointů. Piš YAML, pouze specifikaci, bez komentářů.\n\n${code}`;
  const data = JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi zkušený API architekt. Piš pouze validní OpenAPI 3.0 YAML.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1800
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
        const spec = json.choices[0].message.content.trim();
        cb(null, spec);
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
    ...getFiles('backend/controllers'),
    ...getFiles('backend/routes')
  ];
  let allCode = '';
  for (const file of files) {
    allCode += `\n// ${file}\n` + fs.readFileSync(file, 'utf8');
  }
  generateOpenAPIAI(allCode, (err, spec) => {
    if (err) {
      console.error('AI error:', err);
      process.exit(1);
    }
    fs.writeFileSync('backend/openapi.generated.yaml', spec);
    console.log('OpenAPI specifikace vygenerována do backend/openapi.generated.yaml');
  });
})();
