// ai-dashboard/components/DisasterRecoveryReport.js
import { useEffect, useState } from 'react';

export default function DisasterRecoveryReport() {
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch('/api/admin/disaster-recovery-report');
        if (!res.ok) throw new Error('Chyba při načítání disaster recovery reportu');
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

  if (loading) return <div>Načítám disaster recovery report...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-blue-200 dark:bg-blue-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI Disaster Recovery Report</h2>
      <pre className="whitespace-pre-wrap text-sm md:text-base">{report}</pre>
    </div>
  );
}
