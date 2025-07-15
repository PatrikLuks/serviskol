import { useEffect, useState } from 'react';

export default function LastAutomatedRiskResponse() {
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/last-automated-risk-response')
      .then(r => r.json())
      .then(data => setLog(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-gray-500">Načítání stavu automatizované reakce...</div>;
  if (!log || !log.createdAt) return <div className="text-xs text-gray-500">Žádná automatizovaná reakce na vysoké riziko nebyla zaznamenána.</div>;

  return (
    <div className="bg-orange-50 dark:bg-orange-900 rounded p-3 mb-4 border border-orange-200 dark:border-orange-700">
      <div className="font-semibold text-orange-700 dark:text-orange-300 mb-1">Poslední automatizovaná reakce na vysoké riziko</div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Akce: <b>{log.action}</b></div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Doporučení: <b>{log.details?.recommendations?.join(' ')}</b></div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Čas: <b>{new Date(log.createdAt).toLocaleString()}</b></div>
    </div>
  );
}
