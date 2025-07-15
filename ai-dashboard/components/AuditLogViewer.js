import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

  const permissions = usePermissions();
  const [log, setLog] = useState([]);
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'audit:view');

  useEffect(() => {
    if (canView) {
      setLog([
        { timestamp: '2025-07-15T10:00:00Z', type: 'AI návrh', action: 'schváleno', detail: 'Zlepšit onboarding AI' },
        { timestamp: '2025-07-15T10:05:00Z', type: 'AI návrh', action: 'zamítnuto', detail: 'Automatizovat testy incidentů' },
        { timestamp: '2025-07-15T11:00:00Z', type: 'Report', action: 'vygenerováno', detail: 'AI Executive Summary' },
        { timestamp: '2025-07-15T12:00:00Z', type: 'Prompt', action: 'upraveno', detail: 'Pracuj strategicky podle tohoto zadání:' },
      ]);
    }
  }, [canView]);

  if (!canView) {
    // Logování pokusu o neoprávněný přístup
    if (session?.user) {
      logUnauthorizedAccess({
        user: session.user,
        action: 'view',
        section: 'audit-log',
      });
    }
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Auditní log AI akcí</h2>
        <div className="text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit auditní log. Kontaktujte správce.</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Auditní log AI akcí</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-2 py-1 border">čas</th>
              <th className="px-2 py-1 border">Typ</th>
              <th className="px-2 py-1 border">Akce</th>
              <th className="px-2 py-1 border">Detail</th>
            </tr>
          </thead>
          <tbody>
            {log.map((l, i) => (
              <tr key={i} className="border-b">
                <td className="px-2 py-1 border whitespace-nowrap">{l.timestamp}</td>
                <td className="px-2 py-1 border">{l.type}</td>
                <td className={"px-2 py-1 border "+(l.action==='schváleno'?'text-green-700':l.action==='zamítnuto'?'text-red-700':'')}>{l.action}</td>
                <td className="px-2 py-1 border">{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
