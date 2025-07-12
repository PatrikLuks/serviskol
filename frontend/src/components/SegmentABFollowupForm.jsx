import React, { useState } from 'react';
import axios from 'axios';

export default function SegmentABFollowupForm({ segment, channel, onSuccess }) {
  const [variants, setVariants] = useState([
    { label: 'A', text: '', error: '' },
    { label: 'B', text: '', error: '' }
  ]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleChange = (i, value) => {
    setVariants(vs => vs.map((v, idx) => idx === i ? { ...v, text: value, error: '' } : v));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    // Validace
    let valid = true;
    setVariants(vs => vs.map(v => {
      if (!v.text.trim()) {
        valid = false;
        return { ...v, error: 'Zadejte text zprávy.' };
      }
      return { ...v, error: '' };
    }));
    if (!valid) { setLoading(false); return; }
    try {
      await axios.post('/api/admin/alert-logs/execute-segment-followup-ab', {
        segment,
        channel,
        variants: variants.map(v => ({ label: v.label, text: v.text })),
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined
      });
      setResult('A/B test follow-upů naplánován.');
      if (onSuccess) onSuccess();
    } catch {
      setResult('Chyba při plánování A/B testu.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 p-2 border rounded bg-gray-50">
      <div className="font-semibold">A/B test follow-up zpráv</div>
      {variants.map((v, i) => (
        <div key={v.label} className="flex flex-col gap-1">
          <label>Varianta {v.label}:</label>
          <textarea value={v.text} onChange={e => handleChange(i, e.target.value)} rows={2} className="border p-1" />
          {v.error && <span className="text-red-500 text-xs">{v.error}</span>}
        </div>
      ))}
      <div className="flex gap-2 items-center">
        <label className="text-xs">Naplánovat odeslání na:</label>
        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="border p-1 text-xs" />
      </div>
      <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded" disabled={loading}>Naplánovat A/B test</button>
      {result && <div className="text-green-700 text-sm">{result}</div>}
    </form>
  );
}
