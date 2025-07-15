// scripts/ai-prompt-test.js
// Automatizované AI testování promptů
// Usage: node scripts/ai-prompt-test.js

const fs = require('fs');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const promptsPath = path.join(__dirname, '../prompts/prompts.json');

function readPrompts(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

async function testPrompt(openai, promptObj) {
  const prompt = promptObj.prompt || promptObj.text || '';
  if (!prompt.trim()) return { ...promptObj, result: 'SKIPPED', message: 'Empty prompt' };
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Testuj prompt pro vývojářský tým.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100
    });
    const output = completion.data.choices[0].message.content;
    if (output && output.trim().length > 0) {
      return { ...promptObj, result: 'OK', message: output.slice(0, 100) };
    } else {
      return { ...promptObj, result: 'FAIL', message: 'No output' };
    }
  } catch (e) {
    return { ...promptObj, result: 'ERROR', message: e.message };
  }
}

(async () => {
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompts = readPrompts(promptsPath);
  const results = [];
  for (const promptObj of prompts) {
    results.push(await testPrompt(openai, promptObj));
  }
  const report = `# AI Prompt Test Report\n\n${new Date().toISOString()}\n\n` +
    results.map(r => `- **${r.name || r.id || 'prompt'}**: ${r.result} (${r.message})`).join('\n');
  fs.writeFileSync('ai-prompt-test-report.md', report);
  console.log(report);
  if (results.some(r => r.result !== 'OK' && r.result !== 'SKIPPED')) process.exit(1);
})();
