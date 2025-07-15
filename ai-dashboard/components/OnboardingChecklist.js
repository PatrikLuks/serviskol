// ai-dashboard/components/OnboardingChecklist.js
import { useEffect, useState } from 'react';

export default function OnboardingChecklist() {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch('/api/admin/onboarding-checklist');
        if (!res.ok) throw new Error('Chyba při načítání checklistu');
        const data = await res.json();
        setChecklist(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchChecklist();
  }, []);

  if (loading) return <div>Načítám onboarding checklist...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Checklist</h2>
      <ul className="list-disc pl-6">
        {checklist.map((item, idx) => (
          <li key={idx} className={item.done ? 'line-through text-gray-400' : ''}>{item.task}</li>
        ))}
      </ul>
    </div>
  );
}
