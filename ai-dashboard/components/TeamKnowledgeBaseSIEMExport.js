// ai-dashboard/components/TeamKnowledgeBaseSIEMExport.js
import { useState } from 'react';

export default function TeamKnowledgeBaseSIEMExport() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/team-knowledge-base-siem-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při exportu knowledge base do SIEM/SOC');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Export týmového knowledge base do SIEM/SOC</h2>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? 'Probíhá export...' : 'Exportovat knowledge base do SIEM/SOC'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
