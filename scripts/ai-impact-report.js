// scripts/ai-impact-report.js
// AI management report: sumarizace dopadu AI automatizací
// Usage: node scripts/ai-impact-report.js

const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const reportFiles = [
  'ai-usage-report.md',
  'ai-healthcheck-report.md',
  'ai-alert-report.md',
  'ai-prompt-test-report.md',
  'onboarding/onboarding_*.md',
  'CHANGELOG.md',
];

function readAllReports(files) {
  let content = '';
  for (const file of files) {
    if (file.includes('*')) {
      // glob-like support for onboarding reports
      const dir = path.dirname(file);
      const pattern = path.basename(file).replace('*', '');
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          if (f.startsWith(pattern)) {
            content += `\n--- ${dir}/${f} ---\n` + fs.readFileSync(path.join(dir, f), 'utf8');
          }
        }
      }
    } else if (fs.existsSync(file)) {
      content += `\n--- ${file} ---\n` + fs.readFileSync(file, 'utf8');
    }
  }
  return content;
}

(async () => {
  const allReports = readAllReports(reportFiles);
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI management analytik. Na základě následujících AI reportů vygeneruj přehledný management report pro vedení: trendy, přínosy, doporučení, rizika, dopad na kvalitu, rychlost a bezpečnost vývoje.\n\n${allReports}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI management analytik pro vývojářský tým.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-impact-report.md', output);
  console.log('AI impact report vygenerován: ai-impact-report.md');
})();
