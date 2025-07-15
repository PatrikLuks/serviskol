import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function AISecurityAnalysis() {
  const { data: session } = useSession();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pouze admin/superadmin/approver
  if (!['admin','superadmin','approver'].includes(session?.user?.role)) return null;

  useEffect(() => {
    async function fetchAI() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/ai-security-analysis');
        const data = await res.json();
        setResult(data.result);
      } catch (e) {
        setError('Chyba při načítání AI bezpečnostní analýzy.');
      }
      setLoading(false);
    }
    fetchAI();
  }, []);

  if (loading) return <div className="mt-8">Načítání AI bezpečnostní analýzy...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!result) return <div className="mt-8 text-green-600">Žádná AI bezpečnostní rizika detekována.</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2 text-purple-700">AI bezpečnostní analýza</h2>
      <pre className="bg-purple-50 dark:bg-purple-900 p-4 rounded whitespace-pre-wrap overflow-x-auto text-sm text-purple-900 dark:text-purple-200">{result}</pre>
    </div>
  );
}
