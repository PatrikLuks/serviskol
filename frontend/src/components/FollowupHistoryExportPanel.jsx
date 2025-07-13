import React, { useState } from 'react';
import axios from 'axios';

export default function FollowupHistoryExportPanel() {
  const [format, setFormat] = useState('csv');
  const [segment, setSegment] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setDownloading(true);
    setError('');
    try {
      const params = [];
      if (segment) params.push(`segment=${encodeURIComponent(segment)}`);
      if (from) params.push(`from=${encodeURIComponent(from)}`);
      if (to) params.push(`to=${encodeURIComponent(to)}`);
      params.push(`format=${format}`);
      const url = `/api/bi/followup-history?${params.join('&')}`;
      const res = await axios.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = format === 'csv' ? 'followup-history.csv' : 'followup-history.json';
      link.click();
    } catch {
      setError('Chyba při exportu');
    }
    setDownloading(false);
  };

  return (
    <div className="mb-8">
      <h3 className="font-bold mb-2">Export historie follow-upů</h3>
      <div className="flex gap-2 items-end mb-2">
        <input value={segment} onChange={e => setSegment(e.target.value)} placeholder="Segment (volitelné)" className="border px-2 py-1 rounded w-32" />
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border px-2 py-1 rounded" />
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border px-2 py-1 rounded" />
        <select value={format} onChange={e => setFormat(e.target.value)} className="border px-2 py-1 rounded">
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
        <button onClick={handleExport} className="bg-blue-700 text-white px-3 py-1 rounded" disabled={downloading}>{downloading ? 'Exportuji...' : 'Exportovat'}</button>
      </div>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
