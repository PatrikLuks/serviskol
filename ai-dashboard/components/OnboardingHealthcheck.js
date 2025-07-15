// ai-dashboard/components/OnboardingHealthcheck.js
import { useEffect, useState } from 'react';

export default function OnboardingHealthcheck() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/admin/onboarding-healthcheck');
        if (!res.ok) throw new Error('Chyba při načítání healthchecku');
        const data = await res.json();
        setHealth(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHealth();
  }, []);

  if (loading) return <div>Načítám healthcheck onboarding procesu...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!health) return null;

  return (
    <div className={`rounded-lg shadow p-4 mb-6 ${health.status === 'OK' ? 'bg-green-50 dark:bg-green-900' : health.status === 'Pozor!' ? 'bg-orange-50 dark:bg-orange-900' : 'bg-red-50 dark:bg-red-900'}`}>
      <h2 className="text-lg font-bold mb-2">Onboarding Healthcheck (AI)</h2>
      <div className={`mb-2 font-semibold ${health.status === 'OK' ? 'text-green-700' : health.status === 'Pozor!' ? 'text-orange-700' : 'text-red-700'}`}>Stav: {health.status}</div>
      <div className="mb-2">Souhrn: {health.summary}</div>
      {health.risks.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold">Rizika:</h3>
          <ul className="list-disc pl-6">
            {health.risks.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </div>
      )}
      {health.urgent.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold text-red-700">Urgentní doporučení:</h3>
          <ul className="list-disc pl-6">
            {health.urgent.map((u, idx) => <li key={idx}>{u}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
