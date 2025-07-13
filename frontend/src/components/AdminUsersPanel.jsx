import React, { useEffect, useState } from 'react';
import { useAiSegments } from '../hooks/useAiSegments';
import axios from 'axios';

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSegment, setAiSegment] = useState('');
  const aiSegments = useAiSegments();

  useEffect(() => {
    setLoading(true);
    axios.get('/api/bi/users', { params: aiSegment ? { aiSegment } : {} })
      .then(res => setUsers(res.data.users || []))
      .catch(() => setError('Chyba při načítání uživatelů'))
      .finally(() => setLoading(false));
  }, [aiSegment]);

  return (
    <div className="mb-8">
      <h3 className="font-bold mb-2">Přehled uživatelů podle AI segmentu</h3>
      <div className="mb-2 flex gap-2 items-center">
        <label>AI segment:</label>
        <select value={aiSegment} onChange={e => setAiSegment(e.target.value)} className="border px-2 py-1 rounded">
          <option value="">Vše</option>
          {aiSegments.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full text-xs border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Jméno</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Region</th>
            <th className="border px-2 py-1">Věk</th>
            <th className="border px-2 py-1">AI segment</th>
            <th className="border px-2 py-1">Engagement</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td className="border px-2 py-1">{u.name}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.region}</td>
              <td className="border px-2 py-1">{u.age}</td>
              <td className="border px-2 py-1 font-bold">{u.aiSegment}</td>
              <td className="border px-2 py-1">{u.engagementScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
