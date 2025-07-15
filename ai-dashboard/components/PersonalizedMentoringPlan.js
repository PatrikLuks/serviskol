// ai-dashboard/components/PersonalizedMentoringPlan.js
import { useState } from 'react';

export default function PersonalizedMentoringPlan() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState(null);

  async function handleMentor() {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const res = await fetch('/api/admin/personalized-mentoring-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při generování plánu');
      setResult(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-violet-50 dark:bg-violet-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Personalizovaný mentoringový plán pro tým</h2>
      <button
        className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50"
        onClick={handleMentor}
        disabled={loading}
      >
        {loading ? 'Probíhá generování...' : 'Vygenerovat mentoringový plán'}
      </button>
      {result && <div className="mt-2 text-green-700">{result}</div>}
      {error && <div className="mt-2 text-red-700">{error}</div>}
    </div>
  );
}
