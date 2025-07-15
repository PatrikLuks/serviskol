// ai-dashboard/components/TeamKnowledgeBaseComplianceReport.js
import { useState } from 'react';

export default function TeamKnowledgeBaseComplianceReport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/team-knowledge-base-compliance-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při generování compliance reportu');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-green-100 dark:bg-green-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Compliance report z týmového knowledge base</h2>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Probíhá generování...' : 'Vygenerovat compliance report'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
