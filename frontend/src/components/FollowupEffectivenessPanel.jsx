import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FollowupEffectivenessAiIntegration from './FollowupEffectivenessAiIntegration';

const SEGMENTS = ['VIP', 'aktivní', 'riziko_odchodu', 'ostatní'];

export default function FollowupEffectivenessPanel() {
  const [segment, setSegment] = useState('riziko_odchodu');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/bi/followup-effectiveness', { params: { segment } });
      setData(res.data);
    } catch {
      setError('Chyba při načítání dat');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [segment]);

  return (
    <div className="mb-8">
      <h3 className="font-bold mb-2">Efektivita follow-up automatizací</h3>
      <div className="mb-2 flex gap-2 items-center">
        <label>Segment:</label>
        <select value={segment} onChange={e => setSegment(e.target.value)} className="border px-2 py-1 rounded">
          {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {data && (
        <>
        <div className="flex gap-8 items-center mt-2">
          <div><b>Celkem uživatelů:</b> {data.total}</div>
          <div><b>Stále v segmentu:</b> {data.stillIn} ({data.percentRetained}%)</div>
          <div><b>Přešli zpět:</b> {data.left} ({data.percentLeft}%)</div>
        </div>
        {data.variants && Object.keys(data.variants).length > 0 && (
          <div className="mt-4">
            <b>Efektivita podle varianty (A/B test):</b>
            <FollowupEffectivenessAiIntegration segment={segment} variants={data.variants} />
            <table className="w-full text-xs border mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Varianta</th>
                  <th className="border px-2 py-1">Zasláno</th>
                  <th className="border px-2 py-1">Stále v segmentu</th>
                  <th className="border px-2 py-1">Přešli zpět</th>
                  <th className="border px-2 py-1">Retence (%)</th>
                  <th className="border px-2 py-1">Churn (%)</th>
                </tr>
              </thead>
              <tbody>
                {/* Najdi nejlepší variantu podle retence */}
                {(() => {
                  const entries = Object.entries(data.variants);
                  const best = entries.reduce((a, b) => (b[1].percentRetained > a[1].percentRetained ? b : a), entries[0]);
                  return entries.map(([v, s]) => (
                    <tr key={v} style={v === best[0] ? { background: '#e6ffe6', fontWeight: 'bold' } : {}}>
                      <td className="border px-2 py-1">
                        {v} {v === best[0] && <span className="text-green-700">(doporučeno)</span>}
                        {v === best[0] && (
                          <button
                            className="ml-2 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            onClick={async () => {
                              try {
                                // Najdi odpovídající automatizaci (pro segment)
                                const res = await axios.get('/api/admin/followup-automation');
                                const auto = res.data.find(a => a.triggerSegment === segment);
                                if (auto) {
                                  await axios.post(`/api/admin/followup-automation/${auto._id}/set-default-variant`, { label: v });
                                  alert('Varianta nastavena jako výchozí!');
                                } else {
                                  alert('Automatizace pro segment nenalezena.');
                                }
                              } catch {
                                alert('Chyba při nastavení varianty.');
                              }
                            }}
                          >Nastavit jako výchozí</button>
                        )}
                      </td>
                      <td className="border px-2 py-1">{s.total}</td>
                      <td className="border px-2 py-1">{s.stillIn}</td>
                      <td className="border px-2 py-1">{s.left}</td>
                      <td className="border px-2 py-1">{s.percentRetained}</td>
                      <td className="border px-2 py-1">{s.percentLeft}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
        </>
      )}
    </div>
  );
}
