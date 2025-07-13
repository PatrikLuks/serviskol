import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TimeLogSummaryPanel() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [since, setSince] = useState('');

  useEffect(() => {
    fetchSummary();
  }, [since]);

  async function fetchSummary() {
    setLoading(true);
    try {
      const params = {};
      if (since) params.since = since;
      const res = await axios.get('/api/admin/time-logs', { params });
      // Sumarizace podle uživatele a typu aktivity
      const byUser = {};
      res.data.forEach(l => {
        const user = l.user?.name || 'Neznámý';
        const type = l.activityType || 'jiné';
        if (!byUser[user]) byUser[user] = {};
        if (!byUser[user][type]) byUser[user][type] = 0;
        byUser[user][type] += l.hours;
      });
      setSummary(byUser);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{marginTop:32}}>
      <h3>Souhrn odpracovaných hodin (podle uživatele a aktivity)</h3>
      <input type="date" value={since} onChange={e=>setSince(e.target.value)} style={{marginBottom:8}} />
      {loading ? <div>Načítám…</div> : (
        <table style={{width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th>Uživatel</th>
              <th>Vývoj</th>
              <th>Schůzka</th>
              <th>Testování</th>
              <th>Code review</th>
              <th>Jiné</th>
              <th>Celkem</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary).map(([user, types]) => {
              const total = Object.values(types).reduce((a,b)=>a+b,0);
              return (
                <tr key={user}>
                  <td>{user}</td>
                  <td>{types.development||0}</td>
                  <td>{types.meeting||0}</td>
                  <td>{types.testing||0}</td>
                  <td>{types.review||0}</td>
                  <td>{types.other||0}</td>
                  <td><b>{total}</b></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
