import { usePermissions, hasPermission } from '../utils/permissions';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

  const permissions = usePermissions();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'security:view');
  if (!canView) {
    if (session?.user) {
      logUnauthorizedAccess({
        user: session.user,
        action: 'view',
        section: 'security-alerts',
      });
    }
    return null;
  }

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/security-alerts');
        const data = await res.json();
        setAlerts(data);
      } catch (e) {
        setError('Chyba při načítání alertů.');
      }
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  if (loading) return <div className="mt-8">Načítání bezpečnostních alertů...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!alerts.length) return <div className="mt-8 text-gray-500">Žádné bezpečnostní alerty.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2 text-red-700">Bezpečnostní alerty</h2>
      <table className="min-w-full text-xs border mb-4">
        <thead>
          <tr className="bg-red-100 dark:bg-red-900">
            <th className="px-2 py-1 border">Čas</th>
            <th className="px-2 py-1 border">Typ</th>
            <th className="px-2 py-1 border">Uživatel</th>
            <th className="px-2 py-1 border">Akce</th>
            <th className="px-2 py-1 border">Detail</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, i) => (
            <tr key={i} className="border-b">
              <td className="px-2 py-1 border whitespace-nowrap">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
              <td className="px-2 py-1 border">{a.type}</td>
              <td className="px-2 py-1 border">{a.user?.name || ''} ({a.user?.email || ''})</td>
              <td className="px-2 py-1 border">{a.message}</td>
              <td className="px-2 py-1 border">{a.details ? JSON.stringify(a.details) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
