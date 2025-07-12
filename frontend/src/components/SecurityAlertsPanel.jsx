import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SecurityAlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // refresh každých 30s
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/admin/security-alerts');
      setAlerts(res.data);
    } catch (e) {
      setError('Chyba při načítání alertů.');
    }
    setLoading(false);
  }

  return (
    <div style={{marginTop:32}}>
      <h3>Bezpečnostní alerty</h3>
      {loading ? <div>Načítám…</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th>Typ</th>
              <th>Zpráva</th>
              <th>Uživatel</th>
              <th>Akce provedl</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map(a => (
              <tr key={a._id} style={{background:a.type==='role-change'?'#fff3cd':'#f8d7da'}}>
                <td>{a.type}</td>
                <td>{a.message}</td>
                <td>{a.user?.name} ({a.user?.email})</td>
                <td>{a.performedBy?.name} ({a.performedBy?.email})</td>
                <td>{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
