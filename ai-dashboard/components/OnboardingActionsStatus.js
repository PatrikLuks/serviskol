// ai-dashboard/components/OnboardingActionsStatus.js
import { useEffect, useState } from 'react';

export default function OnboardingActionsStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/admin/onboarding-actions-status');
        if (!res.ok) throw new Error('Chyba při načítání stavu akčních kroků');
        const data = await res.json();
        setStatus(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  if (loading) return <div>Načítám stav akčních kroků...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!status) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Stav plnění akčních kroků z retrospektiv</h2>
      <div className="mb-2">Celkem akčních kroků: <b>{status.total}</b></div>
      <div className="mb-2">Splněno: <b>{status.done}</b></div>
      <div className="mb-2">Nesplněno: <b>{status.notDone}</b></div>
      <div className={status.notDone > 0 ? 'text-red-700 font-semibold mb-2' : 'text-green-700 font-semibold mb-2'}>{status.alert}</div>
      <ul className="list-disc pl-6">
        {status.actions.map((a, idx) => (
          <li key={idx} className={a.done ? 'line-through text-gray-400' : 'text-orange-900 dark:text-orange-100'}>{a.action}</li>
        ))}
      </ul>
    </div>
  );
}
