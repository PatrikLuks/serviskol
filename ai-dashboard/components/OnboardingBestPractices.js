// ai-dashboard/components/OnboardingBestPractices.js
import { useEffect, useState } from 'react';

export default function OnboardingBestPractices() {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPractices() {
      try {
        const res = await fetch('/api/admin/onboarding-best-practices');
        if (!res.ok) throw new Error('Chyba při načítání best practices');
        const data = await res.json();
        setPractices(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPractices();
  }, []);

  function handleExport() {
    const text = practices.map(p => `- ${p}`).join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onboarding_best_practices.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div>Načítám best practices...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-lime-50 dark:bg-lime-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Best Practices (AI)</h2>
      <ul className="list-disc pl-6 mb-4">
        {practices.map((p, idx) => <li key={idx}>{p}</li>)}
      </ul>
      <button
        className="px-4 py-2 rounded bg-lime-600 text-white font-semibold hover:bg-lime-700 transition"
        onClick={handleExport}
      >
        Exportovat best practices (Markdown)
      </button>
    </div>
  );
}
