// ai-dashboard/components/OnboardingEscalationStatus.js
import { useState } from 'react';

export default function OnboardingEscalationStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleEscalate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/onboarding-escalate', { method: 'POST' });
      if (!res.ok) throw new Error('Chyba při eskalaci slabin');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-red-50 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Eskalace slabin onboarding procesu</h2>
      <button
        className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition mb-2"
        onClick={handleEscalate}
        disabled={loading}
      >
        Spustit automatickou eskalaci
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {status && (
        <div className="mt-2">
          {status.escalated
            ? <span className="font-semibold text-red-700">Eskalace provedena: {status.message}</span>
            : <span className="text-gray-700">Není potřeba eskalovat (počet problémů: {status.problemCount})</span>
          }
          <ul className="list-disc pl-6 mt-2">
            {status.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
