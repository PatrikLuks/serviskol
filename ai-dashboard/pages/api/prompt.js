import { Configuration, OpenAIApi } from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { plan, prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY není nastaven.' });

  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Jsi inteligentní asistent." },
        { role: "user", content: `${prompt}\n\nZadání:\n${plan}` }
      ],
      max_tokens: 800,
      temperature: 0.7
    });
    const result = completion.data.choices[0].message.content;
    res.json({ result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
