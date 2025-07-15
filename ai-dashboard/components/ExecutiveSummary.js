import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function ExecutiveSummary() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'executive-summary',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/executive-summary')
      .then(r => r.text())
      .then(md => setSummary(md))
      .catch(() => setError('Chyba při načítání executive summary.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit executive summary.</div>;
  }
  if (loading) return <div className="mt-8">Načítání executive summary...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!summary) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI Executive Summary</h2>
      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked(summary) : summary.replace(/\n/g, '<br/>') }} />
      <div className="flex gap-2 mt-4">
        <a
          href="/api/admin/executive-summary"
          download="executive-summary.md"
          className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
          title="Stáhnout jako Markdown"
        >
          Exportovat Markdown
        </a>
        <a
          href="/api/admin/executive-summary/pdf"
          className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
          title="Stáhnout jako PDF"
        >
          Exportovat PDF
        </a>
      </div>
    </div>
  );
}
