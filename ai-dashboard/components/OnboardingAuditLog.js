// ai-dashboard/components/OnboardingAuditLog.js
import { useEffect, useState } from 'react';

export default function OnboardingAuditLog() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await fetch('/api/admin/onboarding-audit-log');
        if (!res.ok) throw new Error('Chyba při načítání audit logu');
        const data = await res.json();
        setLog(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchLog();
  }, []);

  function handleExport() {
    const text = log.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onboarding_audit_log.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div>Načítám onboarding audit log...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Audit Log (AI)</h2>
      <ul className="list-disc pl-6 mb-4">
        {log.map((entry, idx) => <li key={idx}>{entry}</li>)}
      </ul>
      <button
        className="px-4 py-2 rounded bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
        onClick={handleExport}
      >
        Exportovat audit log (TXT)
      </button>
    </div>
  );
}
