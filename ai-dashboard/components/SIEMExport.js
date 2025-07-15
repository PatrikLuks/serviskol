import { useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';

export default function SIEMExport() {
  const permissions = usePermissions();
  const canExport = hasPermission(permissions, 'governance:export');
  const [type, setType] = useState('alerts');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!canExport) return null;

  async function handleExport() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/siem-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, from, to })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Chyba při exportu');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Export do SIEM/SOC</h2>
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-xs mb-1">Typ</label>
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1">
            <option value="alerts">Alerty</option>
            <option value="audit">Audit log</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Od</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs mb-1">Do</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1" />
        </div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700" onClick={handleExport} disabled={loading}>
          Exportovat do SIEM
        </button>
      </div>
      {loading && <div className="text-xs text-gray-500">Probíhá export...</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {result && (
        <div className="text-xs text-green-700">Exportováno: {result.sent} záznamů, status: {result.status}</div>
      )}
    </div>
  );
}
