import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function NotionTasksReport() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({ user: session.user, action: 'view', section: 'notion-tasks-report' });
      }
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/api/admin/notion-tasks-report')
      .then(r => r.json())
      .then(data => setTasks(data))
      .catch(() => setError('Chyba při načítání reportu Notion úkolů.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [canView]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit report Notion úkolů.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Report stavu Notion úkolů (AI recommendations/lessons learned)</h2>
      {loading && <div className="text-xs text-gray-500">Načítání reportu...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      <table className="min-w-full text-sm mt-4">
        <thead>
          <tr>
            <th className="border px-2">Název</th>
            <th className="border px-2">Stav</th>
            <th className="border px-2">Odkaz</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td className="border px-2">{task.title}</td>
              <td className="border px-2">{task.status}</td>
              <td className="border px-2">
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Otevřít v Notion</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && !loading && <div className="text-xs text-gray-500 mt-4">Žádné úkoly k dispozici.</div>}
    </div>
  );
}
