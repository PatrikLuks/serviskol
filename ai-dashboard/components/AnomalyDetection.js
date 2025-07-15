import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function AnomalyDetection() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'anomaly-detection',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/anomaly-detection')
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => setError('Chyba při detekci anomálií.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit AI detekci anomálií.</div>;
  }
  if (loading) return <div className="mt-8">Načítání AI detekce anomálií...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!result) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">AI detekce anomálií v audit logu</h2>
      <div className="mb-2 text-xs text-gray-500">Detekováno: {new Date(result.detectedAt).toLocaleString()}</div>
      <div className="mb-2 text-xs">Incidenty: {result.incidentsPrev} → {result.incidentsNow}, Změny práv: {result.rightsPrev} → {result.rightsNow}</div>
      {result.anomalies.length === 0 ? (
        <div className="text-green-700 font-bold">Žádné anomálie detekovány.</div>
      ) : (
        <ul className="text-red-700 font-bold list-disc ml-4">
          {result.anomalies.map((a, i) => (
            <li key={i}>{a.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
