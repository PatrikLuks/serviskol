import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function NotionTrendsChart() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({ user: session.user, action: 'view', section: 'notion-trends-chart' });
      }
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/api/admin/notion-tasks-trends')
      .then(r => r.json())
      .then(data => setTrendData(data))
      .catch(() => setError('Chyba při načítání trendů Notion úkolů.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [canView]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit trendovou analýzu Notion úkolů.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Trendová analýza Notion úkolů</h2>
      {loading && <div className="text-xs text-gray-500">Načítání trendů...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {trendData && (
        <Line
          data={trendData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              title: { display: true, text: 'Počet otevřených/uzavřených úkolů v čase' }
            }
          }}
        />
      )}
      {!trendData && !loading && <div className="text-xs text-gray-500 mt-4">Žádná data k dispozici.</div>}
    </div>
  );
}
