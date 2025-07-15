// ai-dashboard/components/OnboardingMentoring.js
import { useEffect, useState } from 'react';

export default function OnboardingMentoring() {
  const [mentoring, setMentoring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMentoring() {
      try {
        const res = await fetch('/api/admin/onboarding-mentoring');
        if (!res.ok) throw new Error('Chyba při načítání mentoring informací');
        const data = await res.json();
        setMentoring(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMentoring();
  }, []);

  if (loading) return <div>Načítám mentoring informace...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!mentoring) return null;

  return (
    <div className="bg-violet-50 dark:bg-violet-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Mentoring (AI)</h2>
      <div className="mb-2">Mentor: <b>{mentoring.mentor}</b> ({mentoring.mentorRole})</div>
      <ul className="list-disc pl-6">
        {mentoring.recommendations.map((item, idx) => (
          <li key={idx} className={item.done ? 'line-through text-gray-400' : 'text-violet-900 dark:text-violet-100'}>{item.recommendation}</li>
        ))}
      </ul>
    </div>
  );
}
