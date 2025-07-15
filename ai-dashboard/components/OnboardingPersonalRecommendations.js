// ai-dashboard/components/OnboardingPersonalRecommendations.js
import { useEffect, useState } from 'react';

export default function OnboardingPersonalRecommendations() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/admin/onboarding-personal-recommendations');
        if (!res.ok) throw new Error('Chyba při načítání doporučení');
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

  if (loading) return <div>Načítám personalizovaná onboarding doporučení...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-cyan-50 dark:bg-cyan-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Personalizovaná onboarding doporučení (AI)</h2>
      <ul className="list-disc pl-6">
        {status.map((item, idx) => (
          <li key={idx} className={item.done ? 'line-through text-gray-400' : 'text-cyan-900 dark:text-cyan-100'}>{item.recommendation}</li>
        ))}
      </ul>
    </div>
  );
}
