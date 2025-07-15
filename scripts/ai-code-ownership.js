// scripts/ai-code-ownership.js
// AI code ownership & mentoring bot
// Usage: node scripts/ai-code-ownership.js

const { execSync } = require('child_process');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function getGitLog() {
  try {
    return execSync('git log --name-only --pretty=format:"%an|%ae"', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

(async () => {
  const log = getGitLog();
  if (!log.trim()) {
    console.log('No git log to analyze.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI code ownership bot. Na základě git logu navrhni CODEOWNERS pro repozitář (složky, soubory, domény) a mentoringové dvojice (senior-junior, reviewer, expert). Výstup:
1. CODEOWNERS (formát GitHub)
2. Mentoring pairs (tabulka: oblast, mentor, mentee, důvod)

Git log:
${log}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI code ownership a mentoring expert.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 1200
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('CODEOWNERS_AI.md', output);
  console.log('AI code ownership report vygenerován: CODEOWNERS_AI.md');
})();
