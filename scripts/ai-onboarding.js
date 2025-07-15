// scripts/ai-onboarding.js
// AI-powered onboarding checklist & micro-workshop generator
// Usage: node scripts/ai-onboarding.js <jmeno>

const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const promptsPath = path.join(__dirname, '../prompts/prompts.json');
const docsPath = path.join(__dirname, '../ONBOARDING_AI.md');
const username = process.argv[2] || 'novacek';

function readFileSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

(async () => {
  const prompts = readFileSafe(promptsPath);
  const docs = readFileSafe(docsPath);
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI onboarding asistent. Na základě promptů, onboarding dokumentace a změn v kódu vygeneruj personalizovaný onboarding checklist a micro-workshop pro nového člena týmu (${username}).

Prompty:
${prompts}

Onboarding dokumentace:
${docs}

Checklist a micro-workshop:`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI onboarding expert pro moderní vývojářský tým.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 700
  });
  const output = completion.data.choices[0].message.content;
  const outPath = path.join(__dirname, `../onboarding/onboarding_${username}.md`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, output);
  console.log(`Onboarding checklist vygenerován: ${outPath}`);
})();
