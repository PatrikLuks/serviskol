// ai-dashboard/components/InnovationAdoptionTrends.js
import { useState } from 'react';

export default function InnovationAdoptionTrends() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/innovation-adoption-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při generování adoption trends reportu');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-pink-50 dark:bg-pink-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Innovation Adoption Trends Report</h2>
      <button
        className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Probíhá generování...' : 'Vygenerovat adoption trends report'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
