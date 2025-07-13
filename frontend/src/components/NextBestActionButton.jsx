import React, { useState } from 'react';

export default function NextBestActionButton({ variantHistory, segment, channel, lastPrediction }) {
  const [loading, setLoading] = useState(false);
  const [nba, setNba] = useState(null);
  const [error, setError] = useState(null);

  const handleNBA = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bi/next-best-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantHistory, segment, channel, lastPrediction })
      });
      const data = await res.json();
      if (data.nba) {
        setNba(data.nba);
      } else {
        setError(data.error || 'Chyba AI doporučení.');
      }
    } catch (e) {
      setError('Chyba komunikace s backendem.');
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop: 8}}>
      <button onClick={handleNBA} disabled={loading}>
        {loading ? 'Analyzuji…' : 'Zobrazit nejlepší další akci (AI)'}
      </button>
      {nba && <div style={{marginTop: 8, background: '#e3f6e3', padding: 8}}><b>Doporučení AI:</b><br/>{nba}</div>}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
