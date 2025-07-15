// ai-dashboard/components/OnboardingReportArchive.js
import { useState } from 'react';

export default function OnboardingReportArchive() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleArchive() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/onboarding-report-archive', { method: 'POST' });
      if (!res.ok) throw new Error('Chyba při archivaci reportu');
      const data = await res.json();
      setStatus(data.message);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Archivace onboarding reportu</h2>
      <button
        className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition mb-2"
        onClick={handleArchive}
        disabled={loading}
      >
        Archivovat a odeslat report managementu
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {status && <div className="text-green-700 mt-2">{status}</div>}
    </div>
  );
}
