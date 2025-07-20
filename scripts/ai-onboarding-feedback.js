// scripts/ai-onboarding-feedback.js
// AI onboarding feedback bot
// Usage: node scripts/ai-onboarding-feedback.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (e) {
    console.error(e);
    return '';
  }
}

(async () => {
  const onboarding = readIfExists('onboarding/onboarding_last.md');
  const feedback = readIfExists('onboarding/feedback.log');
  const audit = readIfExists('backend/logs/audit.log');
  if (!onboarding && !feedback) {
    console.log('No onboarding data found.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI onboarding feedback bot. Na základě těchto dat vygeneruj shrnutí, co zlepšit v onboardingu, navrhni konkrétní akce a aktualizace dokumentace. Piš česky, strukturovaně, s důrazem na praktické kroky.

Onboarding report:
${onboarding}

Feedback log:
${feedback}

Audit log:
${audit}
`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na onboarding a týmovou efektivitu.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-onboarding-feedback.md', output);
  console.log('AI onboarding feedback vygenerován: ai-onboarding-feedback.md');
})();
