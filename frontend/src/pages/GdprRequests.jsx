import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const GdprRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      setError('');
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/gdpr/requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setRequests(data);
      } catch {
        setError('Chyba načítání žádostí.');
      }
      setLoading(false);
    };
    if (user?.role === 'admin') fetchRequests();
  }, [user]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Opravdu nenávratně smazat tohoto uživatele a všechna jeho data?')) return;
    const token = localStorage.getItem('token');
    const res = await fetch('/api/gdpr/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId })
    });
    if (res.ok) alert('Uživatel byl smazán.');
    else alert('Chyba při mazání.');
    window.location.reload();
  };

  if (!user || user.role !== 'admin') return <div>Přístup pouze pro admina.</div>;
  if (loading) return <div>Načítám žádosti...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">GDPR žádosti o výmaz účtu</h2>
      {requests.length === 0 ? <div>Žádné žádosti.</div> : (
        <table className="w-full text-xs border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2">Čas</th>
              <th className="border px-2">Uživatel</th>
              <th className="border px-2">Akce</th>
              <th className="border px-2">Akce admina</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={i}>
                <td className="border px-2">{r.timestamp}</td>
                <td className="border px-2">{r.email || r.userId}</td>
                <td className="border px-2">{r.action}</td>
                <td className="border px-2">
                  <button onClick={() => handleDelete(r.userId)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Smazat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GdprRequests;
