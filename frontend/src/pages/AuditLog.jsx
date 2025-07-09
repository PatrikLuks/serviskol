import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuditLog = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      setError('');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/audit/logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        setError('Chyba načítání logů.');
      }
      setLoading(false);
    };
    if (user?.role === 'admin') fetchLogs();
  }, [user]);

  if (!user || user.role !== 'admin') return <div>Přístup pouze pro admina.</div>;
  if (loading) return <div>Načítám logy...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">Audit logy (posledních {logs.length})</h2>
      <table className="w-full text-xs border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2">Čas</th>
            <th className="border px-2">Uživatel</th>
            <th className="border px-2">Akce</th>
            <th className="border px-2">Detaily</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i}>
              <td className="border px-2">{l.timestamp}</td>
              <td className="border px-2">{l.email || l.userId}</td>
              <td className="border px-2">{l.action}</td>
              <td className="border px-2">{JSON.stringify(l.details)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLog;
