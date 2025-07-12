import React, { useState } from 'react';
import axios from 'axios';

export default function SegmentAIFollowupSuggestion({ segment, ctr, days, onSelect }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/admin/ai/generate-segment-followup-message', {
        segment,
        ctr,
        days
      });
      setSuggestion(res.data.message);
    } catch {
      setError('Chyba při generování AI doporučení.');
    }
    setLoading(false);
  };

  return (
    <div className="my-2">
      <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generuji...' : 'Získat AI doporučení pro follow-up'}
      </button>
      {suggestion && (
        <div className="mt-2 p-2 border rounded bg-blue-50">
          <div className="font-semibold mb-1">AI doporučený text:</div>
          <div className="italic">{suggestion}</div>
          {onSelect && <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => onSelect(suggestion)}>Použít tento text</button>}
        </div>
      )}
      {error && <div className="text-red-500 mt-1">{error}</div>}
    </div>
  );
}
