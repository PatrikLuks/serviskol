import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function GovernanceSelfTest() {
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
          section: 'governance-selftest',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/governance-selftest')
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => setError('Chyba při načítání self-testu.'))
      .finally(() => setLoading(false));
  }, [canView, session]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit self-test governance pipeline.</div>;
  }
  if (loading) return <div className="mt-8">Načítání self-testu governance pipeline...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!result) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Self-test governance/reporting pipeline</h2>
      <div className="mb-2 text-xs text-gray-500">Testováno: {new Date(result.testedAt).toLocaleString()}</div>
      <div className={result.allOk ? 'text-green-700 font-bold mb-2' : 'text-red-700 font-bold mb-2'}>
        {result.allOk ? 'Všechny klíčové části pipeline jsou funkční.' : 'Některé části pipeline selhaly!'}
      </div>
      <ul className="text-xs ml-4 list-disc">
        {result.results.map((r, i) => (
          <li key={i} className={r.ok ? 'text-green-700' : 'text-red-700'}>
            {r.test} {r.ok ? '✔️' : `❌ (${r.error})`}
          </li>
        ))}
      </ul>
    </div>
  );
}
