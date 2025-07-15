// ai-dashboard/components/RightsChangeReport.js
import { useEffect, useState } from 'react';

export default function RightsChangeReport() {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/rights-change-report');
        if (!res.ok) throw new Error('Chyba při načítání rights change reportu');
        const text = await res.text();
        setReport(text);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <div>Načítám rights change report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Rights Change Report</h2>
      <pre className="whitespace-pre-wrap text-sm md:text-base">{report}</pre>
    </div>
  );
}
