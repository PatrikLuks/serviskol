import BiApiDocsPanel from '../components/BiApiDocsPanel';
import NotificationWidget from '../components/NotificationWidget';
import WidgetBox from '../components/WidgetBox';
import WebhookManagerPanel from '../components/WebhookManagerPanel';
import AdminUsersPanel from '../components/AdminUsersPanel';
import SegmentTransitionHeatmap from '../components/SegmentTransitionHeatmap';
import FollowupAutomationPanel from '../components/FollowupAutomationPanel';
import FollowupEffectivenessPanel from '../components/FollowupEffectivenessPanel';
import FollowupHistoryExportPanel from '../components/FollowupHistoryExportPanel';
import BiAlertsPanel from '../components/BiAlertsPanel';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnalyticsFilters from '../components/AnalyticsFilters';
import PaymentDemo from '../components/PaymentDemo';
import AdminApiKeyManager from '../components/AdminApiKeyManager';
import ApiKeyAuditLogPanel from '../components/ApiKeyAuditLogPanel';
import ExportStatsChart from '../components/ExportStatsChart';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [filteredStats, setFilteredStats] = useState(null);
  const [error, setError] = useState('');
  const [userMetrics, setUserMetrics] = useState(null);
  const [exportStats, setExportStats] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchExportStats = async () => {
      try {
        const res = await fetch('/api/export-stats');
        if (!res.ok) throw new Error('Chyba načítání statistik exportů');
        const data = await res.json();
        setExportStats(data);
      } catch (err) {
        setExportStats({ error: err.message });
      }
    };
    if (user?.role === 'admin') fetchExportStats();
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
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Zpět</button>
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

          {/* Přehled uživatelů podle AI segmentu */}
          <AdminUsersPanel />
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
                <BiApiDocsPanel />
                <BiAlertsPanel />
              </div>
              <div className="mt-2"><b>Retence (unikátní uživatelé/týden):</b> {userMetrics.retention.join(', ')}</div>
            </div>
          )}
          {user?.role === 'admin' && (
            <>
              <PaymentDemo />
              <div className="mt-8">
                <AdminApiKeyManager />
                <SegmentTransitionHeatmap />
                <FollowupEffectivenessPanel />
                <FollowupHistoryExportPanel />
                <FollowupAutomationPanel />
                <ApiKeyAuditLogPanel />
                <WebhookManagerPanel />
              </div>
              <h2 className="text-lg font-semibold mt-6 mb-2">Exportní statistiky</h2>
              {exportStats ? (
                exportStats.error ? <div className="text-red-500">{exportStats.error}</div> :
                <>
                  {exportStats.alert && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      <b>ALERT:</b> Za posledních 7 dní bylo zaznamenáno {exportStats.recentFails} selhání exportů! Doporučujeme okamžitou kontrolu systému.<br />
                      <ul className="mt-2 list-disc ml-4">
                        <li>Zkontrolujte <a href="/admin/audit-log" className="underline text-blue-700">audit log</a> exportů.</li>
                        <li>Proveďte troubleshooting podle <a href="/docs/export-checklist" className="underline text-blue-700">checklistu</a>.</li>
                        <li>Kontaktujte technickou podporu, pokud problém přetrvává.</li>
                      </ul>
                      <a href="/api/export-failures-report" download className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded font-semibold">Stáhnout auditní report selhání exportů</a>
                      {/* AuditAiSummary bude vložen níže */}
                      {exportStats.escalation && exportStats.escalation.needed && (
                        <div className="mt-4 p-2 bg-orange-100 border border-orange-400 text-orange-900 rounded flex items-center">
                          <span className="mr-2">🔔</span>
                          <b>Eskalace aktivována:</b> {exportStats.escalation.reason || 'Kritický alert byl eskalován (SMS/email)'}
                        </div>
                      )}
                    </div>
                  )}

                  <ul className="list-disc ml-6 mb-4">

                    <li><b>Celkem exportů:</b> {exportStats.total}</li>
                    <li><b>Úspěšné exporty:</b> {exportStats.success}</li>
                    <li><b>Selhání exportu:</b> {exportStats.fail}</li>
                    <li><b>Poslední úspěch:</b> {exportStats.lastSuccess || '–'}</li>
                    <li><b>Poslední chyba:</b> {exportStats.lastError || '–'}</li>
                  </ul>
                  <ExportStatsChart daily={exportStats.daily} />
                </>
              ) : <div>Načítám exportní statistiky...</div>}
            </>
          )}
        </>
      )}
      {/* Notifikace pro admina/technika */}
      <div className="mt-8">
        <WidgetBox title="Notifikace">
          <NotificationWidget />
        </WidgetBox>
      </div>
    </div>
  );
}

// Komponenta pro zobrazení AI shrnutí a doporučení z auditního reportu
function AuditAiSummary() {
  const [summary, setSummary] = React.useState('');
  React.useEffect(() => {
    fetch('/api/export-failures-report')
      .then(res => res.text())
      .then(text => {
        const aiStart = text.indexOf('AI shrnutí a doporučení:');
        if (aiStart !== -1) {
          setSummary(text.slice(aiStart));
        }
      });
  }, []);
  if (!summary) return null;
  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-400 text-yellow-900 rounded">
      <b>AI shrnutí a doporučení:</b>
      <pre className="whitespace-pre-wrap text-sm mt-2">{summary}</pre>
    </div>
  );
}
