// ai-dashboard/components/OnboardingImprovementRoadmap.js
import { useEffect, useState } from 'react';

export default function OnboardingImprovementRoadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        const res = await fetch('/api/admin/onboarding-improvement-roadmap');
        if (!res.ok) throw new Error('Chyba při načítání roadmapy inovací');
        const data = await res.json();
        setRoadmap(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRoadmap();
  }, []);

  if (loading) return <div>Načítám roadmapu onboarding inovací...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Continuous Improvement Roadmap (AI)</h2>
      <ul className="list-disc pl-6">
        {roadmap.map((item, idx) => (
          <li key={idx} className={item.done ? 'line-through text-gray-400' : 'text-blue-900 dark:text-blue-100'}>
            <b>{item.title}</b>: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
