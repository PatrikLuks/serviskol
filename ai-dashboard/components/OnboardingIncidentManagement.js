// ai-dashboard/components/OnboardingIncidentManagement.js
import { useEffect, useState } from 'react';

export default function OnboardingIncidentManagement() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/onboarding-incidents');
        if (!res.ok) throw new Error('Chyba při načítání incident reportu');
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

  if (loading) return <div>Načítám onboarding incidenty...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Incident Management (AI)</h2>
      <div className="mb-2">Souhrn: {report.summary}</div>
      {report.incidents.length > 0 ? (
        <div className="mb-2">
          <h3 className="font-semibold text-red-700">Detekované incidenty:</h3>
          <ul className="list-disc pl-6">
            {report.incidents.map((i, idx) => <li key={idx}>{i}</li>)}
          </ul>
        </div>
      ) : (
        <div className="text-green-700">Žádné kritické incidenty detekovány.</div>
      )}
      {report.recommendations.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold">Doporučené zásahy:</h3>
          <ul className="list-disc pl-6">
            {report.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
