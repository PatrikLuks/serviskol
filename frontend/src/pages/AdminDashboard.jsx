import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AnalyticsFilters from '../components/AnalyticsFilters';
import PaymentDemo from '../components/PaymentDemo';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);
  const [error, setError] = useState('');
  const [userMetrics, setUserMetrics] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Chyba načítání statistik');
        setStats(data);
      } catch (err) {
        setError(err.message);
      }
    };
    if (user?.role === 'admin' || user?.role === 'mechanic') fetchStats();
  }, [user]);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/user-metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUserMetrics(data);
    };
    if (user?.role === 'admin' || user?.role === 'mechanic') fetchUserMetrics();
  }, [user]);

  const handleFilter = async (params) => {
    const query = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/analytics/filtered?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setFilteredStats(data);
  };

  function handleExport() {
    const token = localStorage.getItem('token');
    fetch('/api/analytics/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        // Audit logování exportu
        fetch('/api/audit/export', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'statistiky.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  function handleExportPDF() {
    const token = localStorage.getItem('token');
    fetch('/api/analytics/export-pdf', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'statistiky.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  function handleExportPDFWithFilters() {
    const params = { from: filteredStats?.from, to: filteredStats?.to, type: filteredStats?.type, mechanic: filteredStats?.mechanic };
    const query = Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    const token = localStorage.getItem('token');
    fetch(`/api/analytics/export-pdf?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'servisni-historie.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  if (!user || (user.role !== 'admin' && user.role !== 'mechanic')) {
    return <div className="p-6 text-red-500">Přístup pouze pro správce/technik.</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard – Statistika</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {!stats ? (
        <div>Načítám...</div>
      ) : (
        <>
          <ul className="list-disc ml-6">
            <li><b>Uživatelů:</b> {stats.userCount}</li>
            <li><b>Kol:</b> {stats.bikeCount}</li>
            <li><b>Servisních záznamů:</b> {stats.serviceCount}</li>
            <li><b>Zpráv v chatu:</b> {stats.messageCount}</li>
            <li><b>Aktivních uživatelů (servis):</b> {stats.activeUsers}</li>
          </ul>
          <h2 className="text-lg font-semibold mt-6 mb-2">Trendy za posledních 6 měsíců</h2>
          <table className="w-full text-sm border mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2">Měsíc</th>
                <th className="border px-2">Uživatelé</th>
                <th className="border px-2">Kola</th>
                <th className="border px-2">Servisy</th>
              </tr>
            </thead>
            <tbody>
              {stats.userTrends.map((t, i) => (
                <tr key={t.month}>
                  <td className="border px-2">{t.month}</td>
                  <td className="border px-2">{t.count}</td>
                  <td className="border px-2">{stats.bikeTrends[i].count}</td>
                  <td className="border px-2">{stats.serviceTrends[i].count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="text-lg font-semibold mt-6 mb-2">Filtry statistik</h2>
          <AnalyticsFilters onChange={handleFilter} />
          {filteredStats && (
            <div className="mb-4">
              <div><b>Celkem servisů:</b> {filteredStats.total}</div>
              <div><b>Podle stavu:</b> {Object.entries(filteredStats.byStatus).map(([k,v]) => `${k}: ${v}`).join(', ')}</div>
              <div><b>Podle technika:</b> {Object.entries(filteredStats.byMechanic).map(([k,v]) => `${k}: ${v}`).join(', ')}</div>
            </div>
          )}
          <button onClick={handleExport} className="px-4 py-2 bg-blue-600 text-white rounded font-semibold mr-2">Exportovat statistiky (CSV)</button>
          <button onClick={handleExportPDF} className="px-4 py-2 bg-green-700 text-white rounded font-semibold">Exportovat statistiky (PDF)</button>
          <button onClick={handleExportPDFWithFilters} className="px-4 py-2 bg-green-800 text-white rounded font-semibold ml-2">Exportovat filtrovanou historii (PDF)</button>
          <h2 className="text-lg font-semibold mt-6 mb-2">Metriky chování uživatelů</h2>
          {userMetrics && (
            <div className="mb-4">
              <div><b>Registrace (konverze):</b> {userMetrics.conversions}</div>
              <div><b>Nejčastější akce:</b> {userMetrics.topActions.map(([a, c]) => `${a}: ${c}`).join(', ')}</div>
              <div className="mt-2"><b>Aktivita (posledních 30 dní):</b></div>
              <div className="flex gap-1 items-end h-16">
                {userMetrics.activity.map((v, i) => (
                  <div key={i} style={{ height: `${v * 2}px` }} className="w-2 bg-green-500" title={v}></div>
                ))}
              </div>
              <div className="mt-2"><b>Retence (unikátní uživatelé/týden):</b> {userMetrics.retention.join(', ')}</div>
            </div>
          )}
          {user?.role === 'admin' && <PaymentDemo />}
        </>
      )}
    </div>
  );
}
