// ai-dashboard/components/OnboardingComplianceReport.js
import { useEffect, useState } from 'react';

export default function OnboardingComplianceReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/onboarding-compliance-report');
        if (!res.ok) throw new Error('Chyba při načítání compliance reportu');
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

  if (loading) return <div>Načítám compliance report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="bg-green-100 dark:bg-green-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Compliance Report (AI)</h2>
      <ul className="list-disc pl-6 mb-4">
        {report.checks.map((c, idx) => (
          <li key={idx} className={c.status ? 'text-green-700' : 'text-red-700 font-semibold'}>
            {c.name}: {c.status ? 'OK' : 'Nesplněno'}
          </li>
        ))}
      </ul>
      {report.recommendations.length > 0 && (
        <div className="mb-2">
          <h3 className="font-semibold text-red-700">Doporučení k nápravě:</h3>
          <ul className="list-disc pl-6">
            {report.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
