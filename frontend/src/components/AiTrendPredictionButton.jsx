import React, { useState } from 'react';

export default function AiTrendPredictionButton({ variantHistory }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bi/variant-trend-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantHistory })
      });
      const data = await res.json();
      if (data.prediction) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || 'Chyba AI predikce.');
      }
    } catch (e) {
      setError('Chyba komunikace s backendem.');
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop: 8}}>
      <button onClick={handlePredict} disabled={loading}>
        {loading ? 'Predikuji…' : 'Zobrazit AI predikci trendu'}
      </button>
      {prediction && <div style={{marginTop: 8, background: '#f6f6f6', padding: 8}}><b>AI predikce trendu:</b><br/>{prediction}</div>}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
