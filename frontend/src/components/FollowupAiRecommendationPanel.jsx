import React, { useState } from 'react';
import axios from 'axios';

export default function FollowupAiRecommendationPanel({ segment, variants }) {
  const [best, setBest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecommend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/bi/followup-predict-best-variant', { segment, variants });
      setBest(res.data.best);
    } catch {
      setError('Chyba při AI doporučení');
    }
    setLoading(false);
  };

  return (
    <div className="mb-4">
      <button onClick={handleRecommend} className="bg-purple-700 text-white px-3 py-1 rounded" disabled={loading}>
        {loading ? 'AI doporučuje...' : 'AI doporučit nejlepší variantu'}
      </button>
      {best && <div className="mt-2 text-green-700 font-bold">AI doporučuje: {best}</div>}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
