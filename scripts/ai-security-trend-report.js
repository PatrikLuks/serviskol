// scripts/ai-security-trend-report.js
// AI security trend report bot
// Usage: node scripts/ai-security-trend-report.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

(async () => {
  const audit = readIfExists('backend/logs/audit.log');
  const alert = readIfExists('ai-alert-report.md');
  const backendPkg = readIfExists('backend/package.json');
  const frontendPkg = readIfExists('frontend/package.json');
  const backendLock = readIfExists('backend/package-lock.json') || readIfExists('backend/pnpm-lock.yaml');
  const frontendLock = readIfExists('frontend/package-lock.json') || readIfExists('frontend/pnpm-lock.yaml');

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI security trend report bot. Na základě těchto logů, alertů a závislostí vygeneruj bezpečnostní trend report: nové hrozby, zranitelnosti, doporučení pro tým. Piš česky, strukturovaně, s důrazem na prevenci a aktuální trendy.\n\nAudit log:\n${audit}\n\nAI Alert:\n${alert}\n\nBackend package.json:\n${backendPkg}\n\nFrontend package.json:\n${frontendPkg}\n\nBackend lock:\n${backendLock}\n\nFrontend lock:\n${frontendLock}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na bezpečnostní trendy a prevenci.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-security-trend-report.md', output);
  console.log('AI security trend report vygenerován: ai-security-trend-report.md');
})();
