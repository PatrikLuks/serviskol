import { useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';

export default function AuditLogExport() {
  const permissions = usePermissions();
  const canExport = hasPermission(permissions, 'governance:export');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [format, setFormat] = useState('json');

  if (!canExport) return null;

  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  if (type) params.append('type', type);
  if (userEmail) params.append('userEmail', userEmail);
  if (format) params.append('format', format);
  const url = `/api/admin/audit-log/export?${params.toString()}`;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Export auditní stopy</h2>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-xs mb-1">Od</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs mb-1">Do</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs mb-1">Typ události</label>
          <input type="text" value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1 w-32" placeholder="např. unauthorized" />
        </div>
        <div>
          <label className="block text-xs mb-1">Uživatel (email)</label>
          <input type="text" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="border rounded px-2 py-1 w-40" />
        </div>
        <div>
          <label className="block text-xs mb-1">Formát</label>
          <select value={format} onChange={e => setFormat(e.target.value)} className="border rounded px-2 py-1">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <a href={url} className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" download>
          Exportovat
        </a>
      </div>
    </div>
  );
}
