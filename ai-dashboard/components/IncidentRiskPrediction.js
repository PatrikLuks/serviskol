import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function IncidentRiskPrediction() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'incident-risk-prediction',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/incident-risk-prediction')
      .then(r => r.json())
      .then(data => setPrediction(data))
      .catch(() => setError('Chyba při načítání predikce rizika.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit predikci rizika incidentů.</div>;
  }
  if (loading) return <div className="mt-8">Načítání predikce rizika incidentů...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!prediction) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Predikce rizika incidentů</h2>
      <div className="mb-2 text-xs text-gray-500">Vygenerováno: {new Date(prediction.generatedAt).toLocaleString()}</div>
      <div className="mb-2">Odhadované riziko: <b className={
        prediction.riskLevel === 'vysoké' ? 'text-red-700' : prediction.riskLevel === 'střední' ? 'text-orange-600' : 'text-green-700'
      }>{prediction.riskLevel}</b></div>
      <div className="mb-2 text-xs">Trend incidentů za poslední 4 týdny:</div>
      <table className="text-xs mb-2 border">
        <thead><tr><th className="border px-2">Týden od</th><th className="border px-2">Incidenty</th><th className="border px-2">Pokusy o přístup</th></tr></thead>
        <tbody>
          {prediction.stats.map(s => (
            <tr key={s.week}>
              <td className="border px-2">{s.week}</td>
              <td className="border px-2">{s.alertCount}</td>
              <td className="border px-2">{s.auditCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-2 text-xs">Trend incidentů: {prediction.alertTrend >= 0 ? '+' : ''}{prediction.alertTrend}, pokusů o přístup: {prediction.auditTrend >= 0 ? '+' : ''}{prediction.auditTrend}</div>
      <div className="mb-2">
        <b>Doporučení:</b>
        <ul className="text-xs ml-4 list-disc">
          {prediction.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
