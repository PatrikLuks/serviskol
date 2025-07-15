// scripts/ai-retrospective.js
// AI retrospektiva bot: automatizované shrnutí sprintu/období
// Usage: node scripts/ai-retrospective.js [<since> <until>]

const { execSync } = require('child_process');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const since = process.argv[2] || '2 weeks ago';
const until = process.argv[3] || 'now';

function getGitSummary(since, until) {
  try {
    return execSync(`git log --since="${since}" --until="${until}" --pretty=format:'%h %an %s'`, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

(async () => {
  const gitSummary = getGitSummary(since, until);
  const aiHealth = readIfExists('ai-healthcheck-report.md');
  const aiAlert = readIfExists('ai-alert-report.md');
  const aiUsage = readIfExists('ai-usage-report.md');
  const onboarding = readIfExists('onboarding/onboarding_last.md');
  const testReport = readIfExists('frontend/coverage/lcov.info') || readIfExists('backend/coverage/lcov.info');

  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI retrospektiva bot. Na základě těchto dat vygeneruj retrospektivní shrnutí sprintu/období: co šlo dobře, co zlepšit, konkrétní návrhy a akční kroky. Piš česky, strukturovaně, s důrazem na zlepšování týmu.

Git summary:
${gitSummary}

AI Healthcheck:
${aiHealth}

AI Alert:
${aiAlert}

AI Usage:
${aiUsage}

Onboarding:
${onboarding}

Test report:
${testReport}
`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI retrospektiva expert pro vývojářský tým.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-retrospective.md', output);
  console.log('AI retrospektiva vygenerována: ai-retrospective.md');
})();
