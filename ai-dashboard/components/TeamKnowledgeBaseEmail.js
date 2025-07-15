// ai-dashboard/components/TeamKnowledgeBaseEmail.js
import { useState } from 'react';

export default function TeamKnowledgeBaseEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleEmail() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/team-knowledge-base-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při odesílání knowledge base e-mailem');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Export týmového knowledge base e-mailem vedení/týmu</h2>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        onClick={handleEmail}
        disabled={loading}
      >
        {loading ? 'Probíhá odesílání...' : 'Odeslat knowledge base e-mailem'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
