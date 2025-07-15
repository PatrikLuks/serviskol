// ai-dashboard/components/OnboardingGamification.js
import { useEffect, useState } from 'react';

export default function OnboardingGamification() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/admin/onboarding-gamification');
        if (!res.ok) throw new Error('Chyba při načítání gamifikace');
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

  if (loading) return <div>Načítám onboarding gamifikaci...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!status) return null;

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Gamifikace (AI)</h2>
      <div className="mb-2">Vaše body: <b>{status.points}</b></div>
      <h3 className="font-semibold mt-4 mb-2">Žebříček:</h3>
      <ol className="list-decimal pl-6 mb-4">
        {status.leaderboard.map((l, idx) => (
          <li key={idx} className={l.points === status.points ? 'font-bold text-yellow-700' : ''}>{l.name}: {l.points} bodů</li>
        ))}
      </ol>
      <h3 className="font-semibold mt-4 mb-2">Jak získat více bodů:</h3>
      <ul className="list-disc pl-6">
        {status.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
      </ul>
    </div>
  );
}
