import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

  const permissions = usePermissions();
  const { data: session } = useSession();
  const [reports, setReports] = useState([]);
  if (!hasPermission(permissions, 'ai:run-report')) {
    logUnauthorizedAccess({ user: session?.user, action: 'view', section: 'AI Reporty' });
    return <div className="mt-8 text-gray-500">Nemáte oprávnění zobrazit AI reporty.</div>;
  }

  useEffect(() => {
    async function fetchReports() {
      // Prototyp: načítání seznamu reportů z lokálního adresáře přes API (bude doplněno backendem)
      // Zatím statický seznam pro demo
      setReports([
        'ai_audit_log-2025-07-15.md',
        'ai_executive_summary-2025-07-15.md',
        'ai_impact_report-2025-07-15.md',
        'ai_lessons_learned-2025-07-15.md',
        'ai_resilience_report-2025-07-15.md',
        'ai_security_audit-2025-07-15.md',
        'ai_trend_scout-2025-07-15.md',
        'voice_of_customer-2025-07-15.md',
      ]);
    }
    fetchReports();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI Reporty</h2>
      <ul className="space-y-1">
        {reports.map(r => (
          <li key={r} className="border-b border-gray-200 dark:border-gray-700 pb-1">
            <span className="font-mono text-sm">{r}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
