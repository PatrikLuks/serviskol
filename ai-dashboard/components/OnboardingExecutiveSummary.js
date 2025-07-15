// ai-dashboard/components/OnboardingExecutiveSummary.js
import { useEffect, useState } from 'react';

export default function OnboardingExecutiveSummary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/admin/onboarding-executive-summary');
        if (!res.ok) throw new Error('Chyba při načítání executive summary');
        const text = await res.text();
        setSummary(text);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return <div>Načítám executive summary...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Executive Summary (AI)</h2>
      <pre className="whitespace-pre-wrap text-sm md:text-base">{summary}</pre>
    </div>
  );
}
