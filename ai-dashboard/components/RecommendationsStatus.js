import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function RecommendationsStatus() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canApprove = hasPermission(permissions, 'governance:approve');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/admin/github-issues')
      .then(r => r.json())
      .then(data => setIssues(data))
      .catch(() => setError('Chyba při načítání doporučení z GitHub Issues.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(issue) {
    if (!canApprove) {
      if (session?.user) {
        await logUnauthorizedAccess({ user: session.user, action: 'approve', section: 'recommendations' });
      }
      setError('Nemáte oprávnění schvalovat doporučení.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/github-issues/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_number: issue.number })
      });
      if (!res.ok) throw new Error('Chyba při uzavírání Issue');
      await fetch('/api/admin/github-issues')
        .then(r => r.json())
        .then(data => setIssues(data));
    } catch {
      setError('Chyba při schvalování/uzavírání Issue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Stav doporučení (Lessons Learned & AI)</h2>
      {loading && <div className="text-xs text-gray-500">Načítání doporučení...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      <table className="min-w-full text-sm mt-4">
        <thead>
          <tr>
            <th className="border px-2">Název</th>
            <th className="border px-2">Stav</th>
            <th className="border px-2">Akce</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(issue => (
            <tr key={issue.id}>
              <td className="border px-2">
                <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{issue.title}</a>
              </td>
              <td className="border px-2">{issue.state === 'open' ? 'Otevřené' : 'Uzavřené'}</td>
              <td className="border px-2">
                {issue.state === 'open' && canApprove && (
                  <button
                    className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                    onClick={() => handleApprove(issue)}
                    disabled={loading}
                  >
                    Schválit/Uzavřít
                  </button>
                )}
                {issue.state === 'open' && !canApprove && (
                  <span className="px-2 py-1 rounded bg-gray-300 text-gray-700 text-xs">Nemáte oprávnění</span>
                )}
                {issue.state === 'closed' && (
                  <span className="px-2 py-1 rounded bg-gray-400 text-white text-xs">Hotovo</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {issues.length === 0 && !loading && <div className="text-xs text-gray-500 mt-4">Žádná doporučení k dispozici.</div>}
    </div>
  );
}
