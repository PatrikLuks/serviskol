import { useState } from 'react';

export default function NotionSyncButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSync() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/admin/notion-sync', { method: 'POST' });
      if (!res.ok) throw new Error('Chyba při synchronizaci s Notion');
      setSuccess(true);
    } catch {
      setError('Chyba při synchronizaci s Notion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        className="px-3 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-700"
        onClick={handleSync}
        disabled={loading}
      >
        Synchronizovat doporučení do Notion
      </button>
      {loading && <span className="ml-2 text-xs text-gray-500">Synchronizace...</span>}
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
      {success && <div className="text-xs text-green-600 mt-2">Synchronizace úspěšná!</div>}
    </div>
  );
}
