import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

export default function ComplianceReport() {
  const permissions = usePermissions();
  const { data: session } = useSession();
  const canExport = hasPermission(permissions, 'governance:export');
  const [report, setReport] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canExport) {
      if (session?.user) {
        logUnauthorizedAccess({
          user: session.user,
          action: 'view',
          section: 'compliance-report',
        });
      }
      return;
    }
    setLoading(true);
    fetch('/api/admin/compliance-report')
      .then(r => r.text())
      .then(md => setReport(md))
      .catch(() => setError('Chyba při načítání compliance reportu.'))
      .finally(() => setLoading(false));
  }, [canExport, session]);

  if (!canExport) {
    return <div className="mt-8 text-gray-600 dark:text-gray-300">Nemáte oprávnění zobrazit compliance report.</div>;
  }
  if (loading) return <div className="mt-8">Načítání compliance reportu...</div>;
  if (error) return <div className="mt-8 text-red-600">{error}</div>;
  if (!report) return null;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Compliance Report (GDPR / ISO 27001)</h2>
      <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: window.marked ? window.marked(report) : report.replace(/\n/g, '<br/>') }} />
      <div className="flex gap-2 mt-4">
        <a
          href="/api/admin/compliance-report"
          download="compliance-report.md"
          className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
          title="Stáhnout jako Markdown"
        >
          Exportovat Markdown
        </a>
        <a
          href="/api/admin/compliance-report/pdf"
          className="px-3 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
          title="Stáhnout jako PDF"
        >
          Exportovat PDF
        </a>
      </div>
    </div>
  );
}
