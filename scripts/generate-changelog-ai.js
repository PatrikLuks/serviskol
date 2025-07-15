// AI changelog generator using OpenAI API (GPT-4o)
// Usage: node scripts/generate-changelog-ai.js <OPENAI_API_KEY>

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const OPENAI_API_KEY = process.argv[2] || process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Missing OpenAI API key!');
  process.exit(1);
}

// Get last git tag (release)
function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0').toString().trim();
  } catch {
    return '';
  }
}

// Get commit messages since last tag
function getCommitsSince(tag) {
  const range = tag ? `${tag}..HEAD` : '';
  const log = execSync(`git log ${range} --pretty=format:%s`).toString();
  return log.split('\n').filter(Boolean);
}

// Call OpenAI API to summarize commits
function summarizeWithAI(commits, cb) {
  const prompt = `Vygeneruj stručný, srozumitelný changelog pro release na základě těchto commitů:\n${commits.map(c => '- ' + c).join('\n')}`;
  const data = JSON.stringify({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi zkušený release manager. Piš česky, přehledně, v bodech.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400
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
        const summary = json.choices[0].message.content.trim();
        cb(null, summary);
      } catch (e) {
        cb(e);
      }
    });
  });
  req.on('error', cb);
  req.write(data);
  req.end();
}

function appendChangelog(tag, summary) {
  const date = new Date().toISOString().slice(0, 10);
  const entry = `\n## ${tag || 'Nový release'} (${date})\n\n${summary}\n`;
  fs.appendFileSync('CHANGELOG.md', entry);
  console.log('Changelog updated!');
}

(async () => {
  const tag = getLastTag();
  const commits = getCommitsSince(tag);
  if (!commits.length) {
    console.log('Žádné nové commity od posledního tagu.');
    process.exit(0);
  }
  console.log('Commit messages:', commits);
  summarizeWithAI(commits, (err, summary) => {
    if (err) {
      console.error('AI error:', err);
      process.exit(1);
    }
    console.log('\nAI changelog:\n', summary);
    appendChangelog(tag, summary);
  });
})();
