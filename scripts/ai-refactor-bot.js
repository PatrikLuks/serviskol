// scripts/ai-refactor-bot.js
// AI refactoring bot: detekce anti-patternů a návrhy na zlepšení
// Usage: node scripts/ai-refactor-bot.js [<commit1> <commit2>]

const { execSync } = require('child_process');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const commit1 = process.argv[2] || 'HEAD~1';
const commit2 = process.argv[3] || 'HEAD';

function getDiff(c1, c2) {
  try {
    return execSync(`git diff ${c1} ${c2} -- . ':(exclude)package-lock.json' ':(exclude)pnpm-lock.yaml'`, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

(async () => {
  const diff = getDiff(commit1, commit2);
  if (!diff.trim()) {
    console.log('No code changes to analyze.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI refaktoringový bot. Projdi diff změn v kódu, detekuj anti-patterny, navrhni refaktoring, best practices a případné bezpečnostní problémy. Vrať konkrétní návrhy a krátké zdůvodnění.\n\n${diff}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI refaktoringový expert pro moderní vývojářský tým.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 700
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-refactor-report.md', output);
  console.log('AI refactor report vygenerován: ai-refactor-report.md');
})();
