// AI code/doc search: embedding + OpenAI API (GPT-4o)
// Usage: node scripts/ai-code-search.js <dotaz> <OPENAI_API_KEY>

const fs = require('fs');
const path = require('path');
const https = require('https');

const query = process.argv[2];
const OPENAI_API_KEY = process.argv[3] || process.env.OPENAI_API_KEY;
if (!query || !OPENAI_API_KEY) {
  console.error('Použití: node scripts/ai-code-search.js "dotaz" <OPENAI_API_KEY>');
  process.exit(1);
}

// Rekurzivně najdi všechny .js, .ts, .md soubory
function getFiles(dir, exts = ['.js', '.ts', '.md'], files = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory() && !f.startsWith('.')) getFiles(p, exts, files);
    else if (exts.includes(path.extname(f))) files.push(p);
  }
  return files;
}

// Načti obsah všech souborů
function getAllContents(files) {
  return files.map(f => ({ file: f, content: fs.readFileSync(f, 'utf8') }));
}

// Vytvoř embeddingy přes OpenAI API
async function getEmbeddings(texts) {
  const results = [];
  for (const t of texts) {
    const data = JSON.stringify({
      model: 'text-embedding-3-small',
      input: t.content.slice(0, 8000) // max 8k tokenů
    });
    const emb = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.openai.com',
        path: '/v1/embeddings',
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
            resolve(json.data[0].embedding);
          } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    results.push({ file: t.file, embedding: emb });
  }
  return results;
}

// Vytvoř embedding dotazu
async function getQueryEmbedding(query) {
  const data = JSON.stringify({ model: 'text-embedding-3-small', input: query });
  return await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/embeddings',
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
          resolve(json.data[0].embedding);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Kosinová podobnost
function cosine(a, b) {
  let s = 0, sa = 0, sb = 0;
  for (let i = 0; i < a.length; i++) {
    s += a[i] * b[i];
    sa += a[i] * a[i];
    sb += b[i] * b[i];
  }
  return s / (Math.sqrt(sa) * Math.sqrt(sb));
}

(async () => {
  const files = getFiles('.', ['.js', '.ts', '.md']);
  const texts = getAllContents(files);
  console.log(`Načteno ${texts.length} souborů.`);
  const fileEmbeddings = await getEmbeddings(texts);
  const queryEmb = await getQueryEmbedding(query);
  // Najdi nejpodobnější soubory
  const scored = fileEmbeddings.map(f => ({ file: f.file, score: cosine(f.embedding, queryEmb) }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 3);
  console.log('Nejrelevantnější soubory:');
  for (const t of top) {
    console.log(`\n--- ${t.file} (score: ${t.score.toFixed(3)}) ---`);
    console.log(fs.readFileSync(t.file, 'utf8').slice(0, 2000));
  }
})();
