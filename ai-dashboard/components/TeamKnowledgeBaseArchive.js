// ai-dashboard/components/TeamKnowledgeBaseArchive.js
import { useState } from 'react';

export default function TeamKnowledgeBaseArchive() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleArchive() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/team-knowledge-base-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při archivaci knowledge base');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-300 dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Archivace týmového knowledge base (S3 bucket)</h2>
      <button
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
        onClick={handleArchive}
        disabled={loading}
      >
        {loading ? 'Probíhá archivace...' : 'Archivovat knowledge base do S3'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
