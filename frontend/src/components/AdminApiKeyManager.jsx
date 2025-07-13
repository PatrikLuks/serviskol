import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminApiKeyManager() {
  const [apiKeys, setApiKeys] = useState([]);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [newKey, setNewKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const PERMISSION_OPTIONS = [
    { value: 'campaigns:read', label: 'Kampaně – čtení' },
    { value: 'segments:read', label: 'Segmenty – čtení' },
    { value: 'export:csv', label: 'Export CSV' },
    { value: 'export:json', label: 'Export JSON' },
    { value: 'metrics:read', label: 'Metriky – čtení' },
  ];

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/api-keys');
      setApiKeys(res.data);
    } catch (e) {
      setError('Chyba při načítání klíčů');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setNewKey(null);
    try {
      const res = await axios.post('/api/admin/api-keys', { email, permissions });
      setNewKey(res.data.apiKey);
      fetchKeys();
    } catch (e) {
      setError(e.response?.data?.error || 'Chyba při generování klíče');
    }
    setLoading(false);
  };

  const handleRevoke = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/admin/api-keys/${email}`);
      fetchKeys();
    } catch (e) {
      setError('Chyba při revokaci klíče');
    }
    setLoading(false);
  };

  const handlePermissionChange = (perm) => {
    setPermissions(prev => prev.includes(perm)
      ? prev.filter(p => p !== perm)
      : [...prev, perm]);
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Správa API klíčů pro BI/Export</h2>
      <div className="mb-4 flex gap-2 flex-wrap items-center">
        <input
          type="email"
          placeholder="Email admina"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <div className="flex gap-2 flex-wrap">
          {PERMISSION_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={permissions.includes(opt.value)}
                onChange={() => handlePermissionChange(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
        <button onClick={handleGenerate} className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading}>
          Vygenerovat nový klíč
        </button>
      </div>
      {newKey && (
        <div className="mb-2 text-green-700">Nový API klíč: <code>{newKey}</code></div>
      )}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">API klíč</th>
            <th className="border px-2 py-1">Oprávnění</th>
            <th className="border px-2 py-1">Akce</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map(u => (
            <tr key={u.email}>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1 font-mono text-xs break-all">{u.apiKey}</td>
              <td className="border px-2 py-1 text-xs">{(u.apiKeyPermissions||[]).join(', ')}</td>
              <td className="border px-2 py-1">
                <button onClick={() => handleRevoke(u.email)} className="bg-red-600 text-white px-2 py-1 rounded" disabled={loading}>
                  Revokovat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
