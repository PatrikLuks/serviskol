// scripts/ai-code-review-coach.js
// AI code review coach bot
// Usage: node scripts/ai-code-review-coach.js [<commit1> <commit2>]

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
  const prompt = `Jsi AI code review coach. Projdi diff změn v kódu, vygeneruj doporučení pro reviewery: na co se zaměřit, kde jsou rizika, kde je prostor pro zlepšení, mentoringové tipy. Piš česky, strukturovaně, s důrazem na kvalitu a bezpečnost.\n\n${diff}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na code review a mentoring.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-code-review-coach.md', output);
  console.log('AI code review coach vygenerován: ai-code-review-coach.md');
})();
