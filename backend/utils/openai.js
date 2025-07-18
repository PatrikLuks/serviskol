// Vygeneruje AI summary a predikci dopadu návrhu pro admina
async function generateFollowupSummary({ segment, ctr, days }) {
  const prompt = `Jsi marketingový analytik. Pro segment uživatelů s vlastnostmi: ${JSON.stringify(segment)} a dlouhodobě nízkým CTR (${(ctr*100).toFixed(1)}%) za posledních ${days} dní:
1) Stručně vysvětli, proč je follow-up doporučen právě tomuto segmentu.
2) Odhadni, o kolik procent by mohl follow-up zvýšit CTR (uveď rozmezí, např. 5-15 %).
Odpověz česky, v bodech, max. 3 věty celkem.`;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY není nastaven');
  const res = await axios.post(OPENAI_API_URL, {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Jsi marketingový analytik.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 120,
    temperature: 0.6
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data.choices[0].message.content.trim();
}
// Jednoduchý wrapper pro OpenAI API (text-davinci-003 nebo gpt-3.5-turbo)
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function generateFollowupMessage({ segment, ctr, days }) {
  const prompt = `Jsi marketingový specialista. Pro segment uživatelů s vlastnostmi: ${JSON.stringify(segment)} a dlouhodobě nízkým CTR (${(ctr*100).toFixed(1)}%) za posledních ${days} dní navrhni krátkou, motivační follow-up zprávu, která zvýší šanci na proklik. Použij češtinu, buď konkrétní, přátelský a stručný.`;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY není nastaven');
  const res = await axios.post(OPENAI_API_URL, {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'Jsi marketingový specialista.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 120,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data.choices[0].message.content.trim();
}

module.exports = { generateFollowupMessage, generateFollowupSummary };
