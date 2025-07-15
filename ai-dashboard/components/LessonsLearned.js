import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function LessonsLearned() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canView = hasPermission(permissions, 'governance:view');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function fetchReport() {
    setLoading(true);
    setError(null);
    setReport('');
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    fetch(`/api/admin/lessons-learned?${params.toString()}`)
      .then(r => r.text())
      .then(md => setReport(md))
      .catch(() => setError('Chyba při načítání lessons learned.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!canView) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'lessons-learned',
        });
      }
      return;
    }
    fetchReport();
    // eslint-disable-next-line
  }, [canView]);

  if (!canView) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit lessons learned/retrospektivu.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI Lessons Learned & Retrospektiva</h2>
      <div className="flex gap-4 items-end mb-4">
        <div>
          <label className="block text-xs mb-1">Od</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs mb-1">Do</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={fetchReport} disabled={loading}>
          Vygenerovat
        </button>
      </div>
      {loading && <div className="text-xs text-gray-500">Načítání lessons learned...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {report && (
        <div className="prose prose-sm dark:prose-invert max-w-none mt-4" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked(report) : report.replace(/\n/g, '<br/>') }} />
      )}
      {report && (
        <a
          href={`/api/admin/lessons-learned?from=${from}&to=${to}`}
          download="lessons-learned.md"
          className="inline-block mt-4 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
          title="Stáhnout jako Markdown"
        >
          Exportovat Markdown
        </a>
      )}
    </div>
  );
}
