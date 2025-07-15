// scripts/ai-knowledge-base.js
// AI knowledge base builder
// Usage: node scripts/ai-knowledge-base.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');
const glob = require('glob');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getDocs() {
  const files = glob.sync('**/*.md', { ignore: ['node_modules/**', 'coverage/**', 'backups/**'] });
  let docs = '';
  for (const file of files) {
    try {
      docs += `\n# ${file}\n` + fs.readFileSync(file, 'utf8').slice(0, 2000);
    } catch {}
  }
  return docs;
}

(async () => {
  const aiReports = [
    'ai-usage-report.md',
    'ai-healthcheck-report.md',
    'ai-alert-report.md',
    'ai-prompt-test-report.md',
    'ai-impact-report.md',
    'ai-retrospective.md',
    'ai-test-coverage-review.md',
    'ai-onboarding-feedback.md'
  ].map(readIfExists).join('\n');
  function readIfExists(path) {
    try { return fs.readFileSync(path, 'utf8'); } catch { return ''; }
  }
  const docs = getDocs();
  const prompt = `Jsi AI knowledge base builder. Na základě těchto dokumentů a AI reportů vygeneruj znalostní bázi pro tým: FAQ, best practices, troubleshooting, onboarding tipy. Piš česky, strukturovaně, vhodné pro wiki.\n\nDokumentace:\n${docs}\n\nAI reporty:\n${aiReports}`;
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na znalostní báze a týmovou dokumentaci.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1800
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-knowledge-base.md', output);
  console.log('AI knowledge base vygenerována: ai-knowledge-base.md');
})();
