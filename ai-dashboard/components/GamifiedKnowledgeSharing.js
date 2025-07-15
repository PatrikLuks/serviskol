// ai-dashboard/components/GamifiedKnowledgeSharing.js
import { useState } from 'react';

export default function GamifiedKnowledgeSharing() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleGamify() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/gamified-knowledge-sharing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při gamifikaci');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Gamifikace sdílení znalostí v týmu</h2>
      <button
        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
        onClick={handleGamify}
        disabled={loading}
      >
        {loading ? 'Probíhá gamifikace...' : 'Spustit AI gamifikaci sdílení znalostí'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
