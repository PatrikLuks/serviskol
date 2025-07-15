// ai-dashboard/components/Admin2FAEnforcement.js
import { useEffect, useState } from 'react';

export default function Admin2FAEnforcement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const res = await fetch('/api/admin/enforce-admin-2fa');
        if (!res.ok) throw new Error('Chyba při načítání enforcementu 2FA');
        const data = await res.json();
        setAdmins(data.missing2FA || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAdmins();
  }, []);

  if (loading) return <div>Načítám enforcement 2FA...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-red-100 dark:bg-red-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Admini bez aktivního 2FA</h2>
      {admins.length === 0 ? (
        <div className="text-green-700">Všichni admini mají aktivní 2FA.</div>
      ) : (
        <ul className="list-disc ml-4">
          {admins.map((a, i) => (
            <li key={i} className="mb-1">{a.name || a.email} <span className="text-xs text-gray-600">({a.email})</span></li>
          ))}
        </ul>
      )}
      {admins.length > 0 && (
        <div className="mt-2 text-sm text-red-700">Doporučení: Vynutit aktivaci 2FA, informovat adminy, blokovat citlivé akce do splnění.</div>
      )}
    </div>
  );
}
