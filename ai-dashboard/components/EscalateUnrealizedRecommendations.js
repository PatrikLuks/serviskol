// ai-dashboard/components/EscalateUnrealizedRecommendations.js
import { useState } from 'react';

export default function EscalateUnrealizedRecommendations() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleEscalate() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/escalate-unrealized-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při eskalaci');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-red-50 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Eskalace nerealizovaných AI doporučení</h2>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        onClick={handleEscalate}
        disabled={loading}
      >
        {loading ? 'Probíhá eskalace...' : 'Eskalovat otevřené AI doporučení vedení'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
