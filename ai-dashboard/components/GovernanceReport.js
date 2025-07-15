import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function GovernanceReport() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const canExport = hasPermission(permissions, 'governance:export');

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'governance-report',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/governance-report')
      .then(r => r.json())
      .then(data => setReport(data))
      .catch(() => setError('Chyba při načítání governance reportu.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit Governance Report.</div>;
  }
  if (loading) return <div className="mt-8">Načítání governance reportu...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI Governance Report</h2>
      <div className="mb-2 text-xs text-gray-500 flex items-center gap-4">
        <span>Vygenerováno: {new Date(report.generatedAt).toLocaleString()}</span>
        {canExport && (
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
            onClick={() => {
              window.open('/api/admin/governance-report/export', '_blank');
            }}
            title="Exportovat governance report jako JSON"
          >
            Exportovat JSON
          </button>
        )}
      </div>
      <div className="mb-4">
        <b>Souhrn:</b> Audit logů: {report.summary.auditEventCount}, Bezpečnostních alertů: {report.summary.securityAlertCount}, Změn práv: {report.summary.userChangeCount}, Pokusů o neoprávněný přístup: {report.summary.unauthorizedAttemptCount}
      </div>

      <div className="mb-4">
        <b>Anomálie (meziroční změna):</b>
        <ul className="text-xs ml-4 list-disc">
          <li>Audit logy: {report.anomalySummary.auditEventChange}%</li>
          <li>Bezpečnostní alerty: {report.anomalySummary.securityAlertChange}%</li>
          <li>Změny práv: {report.anomalySummary.userChangeChange}%</li>
          <li>Pokusy o neoprávněný přístup: {report.anomalySummary.unauthorizedAttemptChange}%</li>
        </ul>
      </div>

      <div className="mb-4">
        <b>Nejčastější typy incidentů:</b>
        <ul className="text-xs ml-4 list-disc">
          {report.topIncidentTypes.map(t => (
            <li key={t.type}>{t.type}: {t.count}×</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <b>Nejaktivnější uživatelé (pozitivně):</b>
        <ul className="text-xs ml-4 list-disc">
          {report.topUsers.map(u => (
            <li key={u.email}>{u.email}: {u.count} akcí</li>
          ))}
        </ul>
        <b>Nejaktivnější uživatelé (incidenty):</b>
        <ul className="text-xs ml-4 list-disc">
          {report.topIncidentUsers.map(u => (
            <li key={u.email}>{u.email}: {u.count} incidentů</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <b>Doporučení:</b>
        <ul className="text-xs ml-4 list-disc">
          {report.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <details className="mb-2">
        <summary className="font-semibold cursor-pointer">Audit logy</summary>
        <pre className="overflow-x-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(report.auditEvents, null, 2)}</pre>
      </details>
      <details className="mb-2">
        <summary className="font-semibold cursor-pointer">Bezpečnostní alerty</summary>
        <pre className="overflow-x-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(report.securityAlerts, null, 2)}</pre>
      </details>
      <details className="mb-2">
        <summary className="font-semibold cursor-pointer">Změny práv</summary>
        <pre className="overflow-x-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(report.userChanges, null, 2)}</pre>
      </details>
      <details>
        <summary className="font-semibold cursor-pointer">Pokusy o neoprávněný přístup</summary>
        <pre className="overflow-x-auto text-xs bg-gray-100 p-2 rounded">{JSON.stringify(report.unauthorizedAttempts, null, 2)}</pre>
      </details>
    </div>
  );
}
