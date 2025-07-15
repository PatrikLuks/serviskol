// scripts/ai-changelog-summary.js
// AI changelog summary bot
// Usage: node scripts/ai-changelog-summary.js [<since> <until>]

const { execSync } = require('child_process');
const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const since = process.argv[2] || '2 weeks ago';
const until = process.argv[3] || 'now';

function getGitLog(since, until) {
  try {
    return execSync(`git log --since=\"${since}\" --until=\"${until}\" --pretty=format:'%h %an %s'`, { encoding: 'utf8' });
  } catch {
    return '';
  }
}

(async () => {
  const gitLog = getGitLog(since, until);
  if (!gitLog.trim()) {
    console.log('No git log to summarize.');
    process.exit(0);
  }
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI changelog summary bot. Na základě tohoto git logu vygeneruj srozumitelné shrnutí změn pro uživatele, zákazníky i tým (release notes, newsletter, wiki). Piš česky, stručně, srozumitelně, vhodné pro ne-IT publikum.\n\n${gitLog}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI expert na changelogy a komunikaci změn.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 900
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-changelog-summary.md', output);
  console.log('AI changelog summary vygenerován: ai-changelog-summary.md');
})();
