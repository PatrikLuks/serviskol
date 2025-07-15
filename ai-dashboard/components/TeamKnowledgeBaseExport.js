// ai-dashboard/components/TeamKnowledgeBaseExport.js
import { useState } from 'react';

export default function TeamKnowledgeBaseExport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/team-knowledge-base-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při exportu knowledge base');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Export týmového knowledge base (PDF/Markdown)</h2>
      <button
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? 'Probíhá export...' : 'Exportovat knowledge base'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
