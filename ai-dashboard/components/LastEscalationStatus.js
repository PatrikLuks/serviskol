import { useEffect, useState } from 'react';

export default function LastEscalationStatus() {
  const [escalation, setEscalation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/last-escalation')
      .then(r => r.json())
      .then(data => setEscalation(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-xs text-gray-500">Načítání stavu eskalace...</div>;
  if (!escalation || !escalation.timestamp) return <div className="text-xs text-gray-500">Žádná eskalace incidentu nebyla zaznamenána.</div>;

  return (
    <div className="bg-red-50 dark:bg-red-900 rounded p-3 mb-4 border border-red-200 dark:border-red-700">
      <div className="font-semibold text-red-700 dark:text-red-300 mb-1">Poslední eskalace incidentu</div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Uživatel: <b>{escalation.user}</b></div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Akce: <b>{escalation.action}</b> | Sekce: <b>{escalation.section}</b></div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Počet pokusů: <b>{escalation.count}</b></div>
      <div className="text-xs text-gray-700 dark:text-gray-200">Čas: <b>{new Date(escalation.timestamp).toLocaleString()}</b></div>
    </div>
  );
}
