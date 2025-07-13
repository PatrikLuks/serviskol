import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReportDownloadHistoryPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/audit-log?action=download_report');
      setLogs(res.data);
    } catch (e) {
      setError('Chyba načítání historie');
    }
    setLoading(false);
  }

  return (
    <div className="border rounded p-4 mb-6 bg-gray-50">
      <h3 className="font-bold mb-2">Historie stažení PDF reportů</h3>
      {loading ? <div>Načítání...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-1">Kdo</th>
              <th className="p-1">E-mail</th>
              <th className="p-1">Čas</th>
              <th className="p-1">IP</th>
              <th className="p-1">Prohlížeč</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id}>
                <td className="p-1">{l.performedBy?.name || '-'}</td>
                <td className="p-1">{l.performedBy?.email || '-'}</td>
                <td className="p-1">{l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}</td>
                <td className="p-1">{l.details?.ip || '-'}</td>
                <td className="p-1">{l.details?.userAgent?.slice(0,40) || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
