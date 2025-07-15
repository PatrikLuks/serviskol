import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function WhatIfSimulation() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [incidentDelta, setIncidentDelta] = useState(0);
  const [userChangeDelta, setUserChangeDelta] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function runSimulation() {
    setLoading(true);
    setResult(null);
    setError(null);
    fetch(`/api/admin/whatif-simulation?incidentDelta=${incidentDelta}&userChangeDelta=${userChangeDelta}`)
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => setError('Chyba při what-if simulaci.'))
      .finally(() => setLoading(false));
  }

  if (!canView) {
    if (session?.user) {
      logUnauthorizedAccess({
        user: session.user,
        action: 'view',
        section: 'whatif-simulation',
      });
    }
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění spustit what-if simulaci.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">AI What-if simulace governance</h2>
      <div className="flex gap-4 items-end mb-4">
        <div>
          <label className="block text-xs mb-1">Změna počtu incidentů</label>
          <input type="number" value={incidentDelta} onChange={e => setIncidentDelta(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
        </div>
        <div>
          <label className="block text-xs mb-1">Změna počtu změn práv</label>
          <input type="number" value={userChangeDelta} onChange={e => setUserChangeDelta(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
        </div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={runSimulation} disabled={loading}>
          Spustit simulaci
        </button>
      </div>
      {loading && <div className="text-xs text-gray-500">Probíhá simulace...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {result && (
        <div className="mt-2 border rounded bg-gray-50 dark:bg-gray-800 p-3">
          <div className="mb-1 text-xs text-gray-500">Simulováno: {new Date(result.simulatedAt).toLocaleString()}</div>
          <div className="mb-1 text-xs">Původní incidenty: {result.originalSummary.securityAlertCount}, změny práv: {result.originalSummary.userChangeCount}</div>
          <div className="mb-1 text-xs">Simulované incidenty: {result.simulatedSummary.securityAlertCount}, změny práv: {result.simulatedSummary.userChangeCount}</div>
          <div className="mb-1 text-xs">Riziko: <b>{result.riskLevel}</b></div>
          <div className="mb-1 text-xs"><b>Doporučení:</b> {result.recommendations.join(' ')}</div>
        </div>
      )}
    </div>
  );
}
