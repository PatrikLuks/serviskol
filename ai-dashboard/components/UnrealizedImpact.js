import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function UnrealizedImpact() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [impact, setImpact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({ user: session.user, action: 'view', section: 'unrealized-impact' });
      }
      return;
    }
    setLoading(true);
    setError(null);
    fetch('/api/admin/unrealized-impact')
      .then(r => r.text())
      .then(md => setImpact(md))
      .catch(() => setError('Chyba při načítání AI predikce dopadu.'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [canView]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit AI predikci dopadu nerealizovaných doporučení.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI predikce dopadu nerealizovaných doporučení</h2>
      {loading && <div className="text-xs text-gray-500">Načítání predikce...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {impact && (
        <div className="prose prose-sm dark:prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked(impact) : impact.replace(/\n/g, '<br/>') }} />
      )}
      {!impact && !loading && <div className="text-xs text-gray-500 mt-4">Žádná data k dispozici.</div>}
    </div>
  );
}
