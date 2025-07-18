import React, { useState, useEffect } from 'react';

const ComplianceReportPanel = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [lastExport, setLastExport] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Načtení posledního compliance reportu (PDF)
    fetch('/api/reports/compliance/latest')
      .then(res => res.json())
      .then(data => {
        setPdfUrl(data.pdfUrl);
        setLastExport(data.exportedAt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="mb-6 p-4 border rounded bg-yellow-50">
      <h2 className="text-xl font-bold mb-2">Compliance report & Audit log</h2>
      {loading ? (
        <div>Načítání...</div>
      ) : pdfUrl ? (
        <div>
          <div className="mb-2">Poslední export: <b>{lastExport ? new Date(lastExport).toLocaleString() : 'N/A'}</b></div>
          <a href={pdfUrl} target="_blank" rel="noopener" className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">Stáhnout PDF report</a>
        </div>
      ) : (
        <div className="text-red-500">Report není k dispozici.</div>
      )}
    </section>
  );
};

export default ComplianceReportPanel;
