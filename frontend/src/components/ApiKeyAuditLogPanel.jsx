import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ApiKeyAuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/audit-log?action=bi_api_campaigns')
      .then(res => setLogs(res.data))
      .catch(() => setError('Chyba při načítání logu'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-8 p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2">Audit log použití BI API klíčů</h3>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full text-xs border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Kdo</th>
            <th className="border px-2 py-1">E-mail</th>
            <th className="border px-2 py-1">Formát</th>
            <th className="border px-2 py-1">Oprávnění</th>
            <th className="border px-2 py-1">Čas</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td className="border px-2 py-1">{log.performedBy?.name}</td>
              <td className="border px-2 py-1">{log.performedBy?.email}</td>
              <td className="border px-2 py-1">{log.details?.format}</td>
              <td className="border px-2 py-1">{(log.details?.permissions||[]).join(', ')}</td>
              <td className="border px-2 py-1">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
