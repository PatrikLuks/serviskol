import React, { useEffect, useState } from 'react';
import axios from 'axios';

const activityTypes = [
  { value: 'development', label: 'Vývoj' },
  { value: 'meeting', label: 'Schůzka' },
  { value: 'testing', label: 'Testování' },
  { value: 'review', label: 'Code review' },
  { value: 'other', label: 'Jiné' }
];

export default function TimeLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [since, setSince] = useState('');
  const [activityType, setActivityType] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [addResult, setAddResult] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (since) params.since = since;
      if (activityType) params.activityType = activityType;
      const res = await axios.get('/api/admin/time-logs', { params });
      setLogs(res.data);
    } catch (e) {
      setError('Chyba při načítání time logů.');
    }
    setLoading(false);
  }

  async function addLog() {
    setAddResult('');
    try {
      await axios.post('/api/admin/time-logs', { date, hours: Number(hours), note, activityType });
      setAddResult('Záznam uložen.');
      setDate(''); setHours(''); setNote(''); setActivityType('development');
      fetchLogs();
    } catch {
      setAddResult('Chyba při ukládání.');
    }
  }

  function exportCsv() {
    const params = {};
    if (since) params.since = since;
    if (activityType) params.activityType = activityType;
    params.format = 'csv';
    const url = '/api/admin/time-logs?' + new URLSearchParams(params).toString();
    window.open(url, '_blank');
  }

  return (
    <div style={{marginTop:32}}>
      <h3>Evidence odpracovaných hodin</h3>
      <div style={{marginBottom:8}}>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
        <input type="number" min="0" step="0.25" placeholder="Hodin" value={hours} onChange={e=>setHours(e.target.value)} style={{marginLeft:8,width:60}} />
        <select value={activityType} onChange={e=>setActivityType(e.target.value)} style={{marginLeft:8}}>
          {activityTypes.map(a=>(<option key={a.value} value={a.value}>{a.label}</option>))}
        </select>
        <input type="text" placeholder="Poznámka" value={note} onChange={e=>setNote(e.target.value)} style={{marginLeft:8,width:180}} />
        <button onClick={addLog} style={{marginLeft:8}}>Přidat</button>
        {addResult && <span style={{marginLeft:8,color:'green'}}>{addResult}</span>}
      </div>
      <div style={{marginBottom:8}}>
        <input type="date" value={since} onChange={e=>setSince(e.target.value)} />
        <select value={activityType} onChange={e=>setActivityType(e.target.value)} style={{marginLeft:8}}>
          <option value="">Všechny aktivity</option>
          {activityTypes.map(a=>(<option key={a.value} value={a.value}>{a.label}</option>))}
        </select>
        <button onClick={fetchLogs} style={{marginLeft:8}}>Filtrovat</button>
        <button onClick={exportCsv} style={{marginLeft:8}}>Export CSV</button>
      </div>
      {loading ? <div>Načítám…</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Hodin</th>
              <th>Uživatel</th>
              <th>E-mail</th>
              <th>Typ aktivity</th>
              <th>Poznámka</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l,i) => (
              <tr key={i}>
                <td>{l.date ? new Date(l.date).toLocaleDateString() : ''}</td>
                <td>{l.hours}</td>
                <td>{l.user?.name}</td>
                <td>{l.user?.email}</td>
                <td>{activityTypes.find(a=>a.value===l.activityType)?.label||l.activityType}</td>
                <td>{l.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
