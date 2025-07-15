// scripts/ai-test-coverage-review.js
// AI test coverage review bot
// Usage: node scripts/ai-test-coverage-review.js

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
  const frontendCoverage = readIfExists('frontend/coverage/lcov.info');
  const backendCoverage = readIfExists('backend/coverage/lcov.info');
  if (!frontendCoverage && !backendCoverage) {
    console.log('No coverage reports found.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI test coverage review bot. Na základě těchto coverage reportů identifikuj slabá místa, netestované oblasti, navrhni konkrétní testy a priority pro zlepšení pokrytí. Piš česky, strukturovaně, s důrazem na praktické kroky.

Frontend coverage:
${frontendCoverage}

Backend coverage:
${backendCoverage}
`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na testování a pokrytí kódu.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-test-coverage-review.md', output);
  console.log('AI test coverage review vygenerován: ai-test-coverage-review.md');
})();
