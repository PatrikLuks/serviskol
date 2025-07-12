import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminReportPanel() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [escalated, setEscalated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Backend API pro statistiky a eskalace (předpoklad: rozšíření /api/admin/alert-logs/report)
        const res = await axios.get('/api/admin/alert-logs/report');
        setStats(res.data.stats);
        setPending(res.data.pending);
        setEscalated(res.data.escalated);
      } catch (e) {
        setError('Chyba při načítání reportu.');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Načítání reportu...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mb-8 p-4 border rounded bg-blue-50">
      <div className="font-bold mb-2 text-blue-900">Týdenní report a eskalace</div>
      {stats && (
        <div className="mb-4">
          <div>Nové návrhy: <b>{stats.newProposals}</b></div>
          <div>Schváleno: <b>{stats.approved}</b></div>
          <div>Zamítnuto: <b>{stats.rejected}</b></div>
          <div>Úspěšné follow-upy: <b>{stats.followupSuccess}</b></div>
          <div>Nevyřízené návrhy: <b>{stats.pendingCount}</b></div>
        </div>
      )}
      <div className="mb-4">
        <div className="font-semibold">Nevyřízené návrhy</div>
        {pending.length === 0 ? <div className="text-gray-500">Žádné</div> : (
          <ul className="list-disc ml-5">
            {pending.map(a => (
              <li key={a._id} className="mb-1 text-xs">
                {a.message} <span className="text-gray-500">({new Date(a.createdAt).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mb-4">
        <div className="font-semibold text-red-700">Eskalované návrhy (čekají déle než 7 dní)</div>
        {escalated.length === 0 ? <div className="text-gray-500">Žádné</div> : (
          <ul className="list-disc ml-5">
            {escalated.map(a => (
              <li key={a._id} className="mb-1 text-xs">
                {a.message} <span className="text-gray-500">({new Date(a.createdAt).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="px-3 py-1 bg-blue-700 text-white rounded text-xs"
        onClick={() => window.open('/api/admin/alert-logs/export-csv', '_blank')}
      >Exportovat CSV</button>
    </div>
  );
}
