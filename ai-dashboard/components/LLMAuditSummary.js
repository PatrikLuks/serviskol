import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function LLMAuditSummary() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'llm-audit-summary',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/llm-audit-summary')
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => setError('Chyba při načítání AI shrnutí audit logu.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit AI shrnutí audit logu.</div>;
  }
  if (loading) return <div className="mt-8">Načítání AI shrnutí audit logu...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!result) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">AI shrnutí audit logu (LLM)</h2>
      <div className="mb-2 text-xs text-gray-500">Vygenerováno: {new Date(result.generatedAt).toLocaleString()}</div>
      <div className="mb-2 text-xs text-gray-400">Vzorek logu:</div>
      <pre className="bg-gray-100 dark:bg-gray-800 text-xs p-2 rounded mb-2 overflow-x-auto max-h-40">{result.logSample}</pre>
      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line">
        {result.summary}
      </div>
    </div>
  );
}
