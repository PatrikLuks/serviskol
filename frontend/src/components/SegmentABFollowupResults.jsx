import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SegmentABFollowupResults({ segment, channel }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/ab-followup-results', {
      params: {
        role: segment.role,
        region: segment.region,
        ageGroup: segment.ageGroup,
        channel
      }
    })
      .then(res => {
        setResults(res.data.results || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Chyba při načítání výsledků A/B testů.');
        setLoading(false);
      });
  }, [segment, channel]);

  if (loading) return <div>Načítání výsledků A/B testů...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!results.length) return <div className="text-gray-500">Žádné A/B testy pro tento segment a kanál.</div>;

  const handleExport = () => {
    const params = new URLSearchParams({
      role: segment.role,
      region: segment.region,
      ageGroup: segment.ageGroup,
      channel
    });
    window.open(`/api/admin/ab-followup-results/export-csv?${params.toString()}`);
  };

  const [winnerLoading, setWinnerLoading] = useState(false);
  const [winnerResult, setWinnerResult] = useState('');

  const handleSelectWinner = async (campaignId, autoSend) => {
    setWinnerLoading(true);
    setWinnerResult('');
    try {
      const res = await axios.post('/api/admin/ab-followup-select-winner', { campaignId, autoSend });
      setWinnerResult(res.data.winner ? `Vítěz: ${res.data.winner}${autoSend ? ' – rozeslán všem' : ''}` : 'Vítěz nebyl určen.');
    } catch (e) {
      setWinnerResult('Chyba při vyhodnocení vítěze.');
    }
    setWinnerLoading(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center mb-2">
        <div className="font-semibold flex-1">Výsledky A/B testů follow-upů</div>
        <button onClick={handleExport} className="px-2 py-1 bg-blue-500 text-white rounded text-xs">Exportovat CSV</button>
      </div>
      {results.map((r, i) => (
        <div key={i} className="mb-2">
          <div className="flex gap-2 items-center mb-1">
            <span className="text-xs text-gray-600">Kampaň: {new Date(r.createdAt).toLocaleString()}</span>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded text-xs"
              disabled={winnerLoading}
              onClick={() => handleSelectWinner(r.campaignId, false)}
            >Vyhodnotit vítěze</button>
            <button
              className="px-2 py-1 bg-blue-700 text-white rounded text-xs"
              disabled={winnerLoading}
              onClick={() => handleSelectWinner(r.campaignId, true)}
            >Vyhodnotit a rozeslat vítěze všem</button>
          </div>
        </div>
      ))}
      {winnerResult && <div className="text-green-700 text-sm mb-2">{winnerResult}</div>}
      <table className="min-w-full border text-sm mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Datum</th>
            <th className="border p-1">Varianta</th>
            <th className="border p-1">Text</th>
            <th className="border p-1">Odesláno</th>
            <th className="border p-1">Prokliků</th>
            <th className="border p-1">CTR</th>
            <th className="border p-1">Vítěz</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            r.variants.map((v, j) => (
              <tr key={i + '-' + v.label} className={r.winnerVariant === v.label ? 'bg-green-50' : ''}>
                {j === 0 && (
                  <td className="border p-1" rowSpan={r.variants.length}>{new Date(r.createdAt).toLocaleString()}</td>
                )}
                <td className="border p-1">{v.label}</td>
                <td className="border p-1">{v.text}</td>
                <td className="border p-1">{v.sentCount}</td>
                <td className="border p-1">{v.clickCount}</td>
                <td className="border p-1 font-bold">{(v.ctr*100).toFixed(1)}%</td>
                <td className="border p-1 text-green-700 font-semibold">{r.winnerVariant === v.label ? 'ANO' : ''}</td>
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}
