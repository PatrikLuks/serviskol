// ai-dashboard/components/OnboardingTrendsReport.js
import { useEffect, useState } from 'react';

export default function OnboardingTrendsReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/onboarding-trends');
        if (!res.ok) throw new Error('Chyba při načítání trendů');
        const data = await res.json();
        setReport(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <div>Načítám onboarding trendy...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding trendy a doporučení</h2>
      <div className="mb-2">Celkem feedbacků: <b>{report.totalFeedback}</b></div>
      <div className="mb-2">Počet identifikovaných problémů: <b>{report.problemCount}</b></div>
      <div className="mb-2">Lessons learned: <b>{report.lessonCount}</b></div>
      <h3 className="font-semibold mt-4 mb-2">Doporučení:</h3>
      <ul className="list-disc pl-6">
        {report.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
      </ul>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Zobrazit všechny feedbacky</summary>
        <ul className="list-disc pl-6 text-sm">
          {report.feedbacks.map((f, idx) => <li key={idx}>{f}</li>)}
        </ul>
      </details>
      <details className="mt-2">
        <summary className="cursor-pointer font-semibold">Zobrazit lessons learned</summary>
        <ul className="list-disc pl-6 text-sm">
          {report.lessons.map((l, idx) => <li key={idx}>{l}</li>)}
        </ul>
      </details>
    </div>
  );
}
