import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CampaignsReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [since, setSince] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (since) params.since = since;
      const res = await axios.get('/api/admin/campaigns-report', { params });
      setReport(res.data);
    } catch (e) {
      setError('Chyba při načítání reportu.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, [since]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Zpět</button>
      <h2 className="text-2xl font-bold mb-4">Přehled kampaní</h2>
      <div className="mb-4 flex gap-2 items-center">
        <label>Období od:</label>
        <input type="date" value={since} onChange={e => setSince(e.target.value)} className="border p-1" />
        <button onClick={fetchReport} className="px-3 py-1 bg-blue-500 text-white rounded">Načíst</button>
      </div>
      {loading ? <div>Načítání...</div> : error ? <div className="text-red-500">{error}</div> : report && (
        <div className="space-y-6">
          <div className="flex gap-8">
            <div>
              <div className="font-semibold">Celkem oslovených</div>
              <div className="text-2xl">{report.totalSent}</div>
            </div>
            <div>
              <div className="font-semibold">Celkem prokliků</div>
              <div className="text-2xl">{report.totalClicks}</div>
            </div>
            <div>
              <div className="font-semibold">Celkem follow-upů</div>
              <div className="text-2xl">{report.totalFollowUps}</div>
            </div>
            <div>
              <div className="font-semibold">Prokliky po follow-upu</div>
              <div className="text-2xl">{report.followUpClicks}</div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">Vývoj v čase</div>
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1">Den</th>
                  <th className="border p-1">Oslovení</th>
                  <th className="border p-1">Prokliky</th>
                  <th className="border p-1">Follow-upy</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.byDay).map(([day, d]) => (
                  <tr key={day}>
                    <td className="border p-1">{day}</td>
                    <td className="border p-1">{d.sent}</td>
                    <td className="border p-1">{d.clicks}</td>
                    <td className="border p-1">{d.followUps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="font-semibold mb-2">Segmenty (regiony)</div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1">Region</th>
                  <th className="border p-1">Oslovení</th>
                  <th className="border p-1">Prokliky</th>
                  <th className="border p-1">Počet kampaní</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.segmentStats).map(([region, s]) => (
                  <tr key={region}>
                    <td className="border p-1">{region}</td>
                    <td className="border p-1">{s.sent}</td>
                    <td className="border p-1">{s.clicks}</td>
                    <td className="border p-1">{s.campaigns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsReport;
