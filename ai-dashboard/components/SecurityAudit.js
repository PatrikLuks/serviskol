import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SecurityAudit() {
  const { data: session } = useSession();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pouze admin/superadmin/approver
  if (!['admin','superadmin','approver'].includes(session?.user?.role)) return null;

  useEffect(() => {
    async function fetchAudit() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/security-audit');
        const data = await res.json();
        setRecs(data);
      } catch (e) {
        setError('Chyba při načítání bezpečnostního auditu.');
      }
      setLoading(false);
    }
    fetchAudit();
  }, []);

  if (loading) return <div className="mt-8">Načítání bezpečnostního auditu...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!recs.length) return <div className="mt-8 text-green-600">Žádná bezpečnostní doporučení.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2 text-orange-700">Bezpečnostní doporučení</h2>
      <ul className="list-disc pl-6">
        {recs.map((r, i) => (
          <li key={i} className="mb-2 text-sm text-orange-800 dark:text-orange-300">
            <b>{r.type}:</b> {r.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
