// ai-dashboard/components/OnboardingImpactReport.js
import { useEffect, useState } from 'react';

export default function OnboardingImpactReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/onboarding-impact');
        if (!res.ok) throw new Error('Chyba při načítání dopadu onboarding inovací');
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

  if (loading) return <div>Načítám dopad onboarding inovací...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="bg-teal-50 dark:bg-teal-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Dopad onboarding inovací</h2>
      <div className="mb-2">Produktivita nových členů: <b>{report.productivityScore}%</b></div>
      <div className="mb-2">Spokojenost: <b>{report.satisfactionScore}%</b></div>
      <div className="mb-2">Rychlost zapracování: <b>{report.speedScore}%</b></div>
      <div className="mb-2">Pozitivní feedbacky: <b>{report.positive}</b></div>
      <div className="mb-2">Negativní feedbacky: <b>{report.negative}</b></div>
      <div className="mb-2">Celkem feedbacků: <b>{report.total}</b></div>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Zobrazit všechny feedbacky</summary>
        <ul className="list-disc pl-6 text-sm">
          {report.feedbacks.map((f, idx) => <li key={idx}>{f}</li>)}
        </ul>
      </details>
    </div>
  );
}
