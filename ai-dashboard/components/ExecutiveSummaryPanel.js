import React, { useState, useEffect } from 'react';

const ExecutiveSummaryPanel = () => {
  const [summary, setSummary] = useState('');
  const [lastGenerated, setLastGenerated] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načtení posledního executive summary
    fetch('/api/reports/executive-summary/latest')
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary);
        setLastGenerated(data.generatedAt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="mb-6 p-4 border rounded bg-blue-50">
      <h2 className="text-xl font-bold mb-2">Executive Summary pro vedení</h2>
      {loading ? (
        <div>Načítání...</div>
      ) : summary ? (
        <div>
          <div className="mb-2">Poslední generování: <b>{lastGenerated ? new Date(lastGenerated).toLocaleString() : 'N/A'}</b></div>
          <div className="whitespace-pre-line text-base leading-relaxed bg-white p-4 rounded shadow border mb-2">{summary}</div>
          <a href="/api/reports/executive-summary/export" target="_blank" rel="noopener" className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">Exportovat PDF</a>
        </div>
      ) : (
        <div className="text-red-500">Executive summary není k dispozici.</div>
      )}
    </section>
  );
};

export default ExecutiveSummaryPanel;
