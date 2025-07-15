import { useState, useEffect } from 'react';
import PromptManager from './PromptManager';

  const [plan, setPlan] = useState('');
  const [prompt, setPrompt] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('aiPrompts') || 'null') || [
      'Pracuj strategicky podle tohoto zadání:',
      'Pokračuj ve strategické práci, navrhni další kroky:',
      'Rozděl projekt na fáze a popiš priority:'
    ];
    setPrompts(p);
    if (!prompt && p.length) setPrompt(p[0]);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, prompt })
    });
    const data = await res.json();
    onResult(data.result);
    // Ulož do historie
    const history = JSON.parse(localStorage.getItem('aiHistory') || '[]');
    history.unshift({
      date: new Date().toLocaleString('cs-CZ'),
      prompt,
      plan,
      result: data.result
    });
    localStorage.setItem('aiHistory', JSON.stringify(history.slice(0, 20)));
    setLoading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Zadání / plán</label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={6} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Prompt</label>
          <select value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full border rounded p-2">
            {prompts.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
          {loading ? 'Pracuji...' : 'Pracuj strategicky!'}
        </button>
      </form>
      <PromptManager value={prompt} onChange={setPrompt} />
    </>
  );
}
