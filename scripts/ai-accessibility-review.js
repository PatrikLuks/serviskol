// scripts/ai-accessibility-review.js
// AI accessibility review bot
// Usage: node scripts/ai-accessibility-review.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const glob = require('glob');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getFrontendFiles() {
  return glob.sync('frontend/src/**/*.{js,jsx,ts,tsx,html}', { ignore: ['**/node_modules/**', '**/coverage/**'] });
}

function readIfExists(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

(async () => {
  const files = getFrontendFiles().slice(0, 20).map(f => `\n# ${f}\n` + readIfExists(f).slice(0, 2000)).join('\n');
  const testReport = readIfExists('frontend/coverage/lcov-report/index.html');
  const docs = readIfExists('frontend/README.md');
  const prompt = `Jsi AI accessibility review bot. Projdi ukázky frontend kódu, testy a dokumentaci a vygeneruj accessibility review: nalezené problémy (WCAG, kontrast, ovládání klávesnicí, popisky), doporučení na zlepšení, prioritizace. Piš česky, strukturovaně, s důrazem na praktické kroky.\n\nKód:\n${files}\n\nTest report:\n${testReport}\n\nDokumentace:\n${docs}`;
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na accessibility a frontend.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-accessibility-review.md', output);
  console.log('AI accessibility review vygenerován: ai-accessibility-review.md');
})();
