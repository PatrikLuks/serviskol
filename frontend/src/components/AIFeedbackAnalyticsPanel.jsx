import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AIFeedbackAnalyticsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/alert-logs/ai-feedback-stats')
      .then(res => { setStats(res.data); setLoading(false); })
      .catch(() => { setError('Chyba při načítání statistik.'); setLoading(false); });
  }, []);

  if (loading) return <div>Načítání statistik AI feedbacku...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="mb-8 p-4 border rounded bg-purple-50">
      <div className="font-bold mb-2 text-purple-900">AI feedback & schvalování návrhů</div>
      <div className="mb-4">
        <b>Celkové hodnocení AI návrhů:</b>
        <ul className="list-disc ml-5 text-xs">
          {Object.entries(stats.feedbackCounts).map(([k,v]) => (
            <li key={k}>{k}: <b>{v}</b></li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <b>Stavy schvalování:</b>
        <ul className="list-disc ml-5 text-xs">
          {Object.entries(stats.approvalCounts).map(([k,v]) => (
            <li key={k}>{k}: <b>{v}</b></li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <b>Rozpad podle segmentu:</b>
        <table className="text-xs border mt-2">
          <thead>
            <tr className="bg-purple-100">
              <th className="border px-2">Segment</th>
              <th className="border px-2">Celkem</th>
              <th className="border px-2">Schváleno</th>
              <th className="border px-2">Zamítnuto</th>
              <th className="border px-2">Vynikající</th>
              <th className="border px-2">Dobré</th>
              <th className="border px-2">Špatné</th>
              <th className="border px-2">Mimo</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.bySegment).map(([seg, d]) => (
              <tr key={seg}>
                <td className="border px-2">{seg}</td>
                <td className="border px-2">{d.total}</td>
                <td className="border px-2">{d.approved||0}</td>
                <td className="border px-2">{d.rejected||0}</td>
                <td className="border px-2">{d.feedback.excellent||0}</td>
                <td className="border px-2">{d.feedback.good||0}</td>
                <td className="border px-2">{d.feedback.bad||0}</td>
                <td className="border px-2">{d.feedback.irrelevant||0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
