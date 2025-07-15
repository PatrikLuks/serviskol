// scripts/ai-micro-workshop.js
// AI mikro-workshop bot: generuje krátké workshopy/tipy pro tým
// Usage: node scripts/ai-micro-workshop.js

const fs = require('fs');
const { Configuration, OpenAIApi } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

(async () => {
  const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Jsi AI mentor pro moderní vývojářský tým. Vymysli krátký mikro-workshop (max. 1 stránka) na téma: aktuální best practice, nový trend, bezpečnostní doporučení nebo tip pro efektivní vývoj. Zaměř se na praktické rady, konkrétní příklady a motivaci ke zlepšení. Piš česky, srozumitelně a inspirativně.`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Jsi AI mentor a lektor pro vývojářský tým.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 700
  });
  const output = completion.data.choices[0].message.content;
  fs.writeFileSync('ai-micro-workshop.md', output);
  console.log('AI mikro-workshop vygenerován: ai-micro-workshop.md');
})();
