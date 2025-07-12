import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [since, setSince] = useState('');
  const [action, setAction] = useState('');
  const [admin, setAdmin] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (since) params.since = since;
      if (action) params.action = action;
      if (admin) params.admin = admin;
      const res = await axios.get('/api/admin/audit-log', { params });
      setLogs(res.data);
    } catch (e) {
      setError('Chyba při načítání audit logu.');
    }
    setLoading(false);
  }

  function exportCsv() {
    const params = {};
    if (since) params.since = since;
    if (action) params.action = action;
    if (admin) params.admin = admin;
    params.format = 'csv';
    const url = '/api/admin/audit-log?' + new URLSearchParams(params).toString();
    window.open(url, '_blank');
  }

  return (
    <div style={{marginTop:32}}>
      <h3>Audit log admin akcí</h3>
      <div style={{marginBottom:8}}>
        <input type="date" value={since} onChange={e=>setSince(e.target.value)} />
        <input type="text" placeholder="Akce" value={action} onChange={e=>setAction(e.target.value)} style={{marginLeft:8}} />
        <input type="text" placeholder="Admin (id)" value={admin} onChange={e=>setAdmin(e.target.value)} style={{marginLeft:8}} />
        <button onClick={fetchLogs} style={{marginLeft:8}}>Filtrovat</button>
        <button onClick={exportCsv} style={{marginLeft:8}}>Export CSV</button>
      </div>
      {loading ? <div>Načítám…</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th>Akce</th>
              <th>Kdo</th>
              <th>E-mail</th>
              <th>Cílový uživatel</th>
              <th>Cílový e-mail</th>
              <th>Detaily</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id}>
                <td>{l.action}</td>
                <td>{l.performedBy?.name}</td>
                <td>{l.performedBy?.email}</td>
                <td>{l.targetUser?.name}</td>
                <td>{l.targetUser?.email}</td>
                <td><pre style={{fontSize:11,whiteSpace:'pre-wrap'}}>{JSON.stringify(l.details,null,1)}</pre></td>
                <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
