// scripts/ai-dependency-update-advisor.js
// AI dependency update advisor bot
// Usage: node scripts/ai-dependency-update-advisor.js

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
  const pkg = readIfExists('package.json');
  const backendPkg = readIfExists('backend/package.json');
  const frontendPkg = readIfExists('frontend/package.json');
  const lock = readIfExists('package-lock.json') || readIfExists('pnpm-lock.yaml');
  const backendLock = readIfExists('backend/package-lock.json') || readIfExists('backend/pnpm-lock.yaml');
  const frontendLock = readIfExists('frontend/package-lock.json') || readIfExists('frontend/pnpm-lock.yaml');
  const audit = readIfExists('backend/logs/audit.log');
  const alert = readIfExists('ai-alert-report.md');

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI dependency update advisor. Na základě těchto souborů a reportů doporuč, které závislosti upgradovat, kde jsou rizika, co je urgentní, včetně bezpečnostních a breaking changes. Piš česky, strukturovaně, s důrazem na bezpečnost a stabilitu.\n\nRoot package.json:\n${pkg}\n\nBackend package.json:\n${backendPkg}\n\nFrontend package.json:\n${frontendPkg}\n\nRoot lock:\n${lock}\n\nBackend lock:\n${backendLock}\n\nFrontend lock:\n${frontendLock}\n\nAudit log:\n${audit}\n\nAI Alert:\n${alert}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na dependency management a bezpečnost.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-dependency-update-advisor.md', output);
  console.log('AI dependency update advisor vygenerován: ai-dependency-update-advisor.md');
})();
