// ai-dashboard/components/MicroWorkshopGenerator.js
import { useState } from 'react';

export default function MicroWorkshopGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/micro-workshop-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při generování workshopů');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Micro-Workshop Generator pro tým</h2>
      <button
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Probíhá generování...' : 'Vygenerovat micro-workshopy'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
