import React, { useEffect, useState } from 'react';
import { useAiSegments } from '../hooks/useAiSegments';
import axios from 'axios';

export default function WebhookManagerPanel() {
  const aiSegments = useAiSegments();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState({});
  const [triggering, setTriggering] = useState(null);
  // Form state
  const [form, setForm] = useState({
    url: '', event: 'bi_export', format: 'json', frequency: 'daily', filterType: 'campaigns', active: true,
    segment: '', region: '', ageMin: '', ageMax: '', channel: '', predType: ''
  });
  const [creating, setCreating] = useState(false);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/webhooks');
      setWebhooks(res.data);
    } catch (e) {
      setError('Chyba při načítání webhooků');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleTrigger = async (id) => {
    setTriggering(id);
    try {
      await axios.post(`/api/admin/webhooks/${id}/trigger`);
      fetchWebhooks();
      fetchHistory(id);
    } catch (e) {
      setError('Chyba při ručním spuštění webhooku');
    }
    setTriggering(null);
  };

  const fetchHistory = async (id) => {
    try {
      const res = await axios.get(`/api/admin/webhooks/${id}/history`);
      setHistory(h => ({ ...h, [id]: res.data }));
    } catch (e) {
      setError('Chyba při načítání historie');
    }
  };

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async e => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const filter = {
        type: form.filterType,
        segment: form.segment || undefined,
        region: form.region || undefined,
        ageMin: form.ageMin || undefined,
        ageMax: form.ageMax || undefined,
        channel: form.channel || undefined,
        predType: form.predType || undefined
      };
      await axios.post('/api/admin/webhooks', {
        url: form.url,
        event: form.event,
        format: form.format,
        frequency: form.frequency,
        filter,
        active: form.active
      });
      setForm({ url: '', event: 'bi_export', format: 'json', frequency: 'daily', filterType: 'campaigns', active: true, segment: '', region: '', ageMin: '', ageMax: '', channel: '', predType: '' });
      fetchWebhooks();
    } catch (e) {
      setError('Chyba při vytváření webhooku');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Opravdu smazat tento webhook?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/webhooks/${id}`);
      fetchWebhooks();
    } catch (e) {
      setError('Chyba při mazání webhooku');
    }
    setLoading(false);
  };

  const handleToggleActive = async (id, active) => {
    setLoading(true);
    try {
      await axios.patch(`/api/admin/webhooks/${id}`, { active: !active });
      fetchWebhooks();
    } catch (e) {
      setError('Chyba při změně aktivace webhooku');
    }
    setLoading(false);
  };

  return (
    <div className="mt-8 p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2">Webhooky BI exportu</h3>
      <form className="mb-4 flex flex-wrap gap-2 items-end" onSubmit={handleCreate}>
        <input name="url" value={form.url} onChange={handleFormChange} required placeholder="Webhook URL" className="border px-2 py-1 rounded w-64" />
        <select name="event" value={form.event} onChange={handleFormChange} className="border px-2 py-1 rounded">
          <option value="bi_export">BI export</option>
        </select>
        <select name="filterType" value={form.filterType} onChange={handleFormChange} className="border px-2 py-1 rounded">
          <option value="campaigns">Kampaně</option>
          <option value="segments">Segmenty</option>
          <option value="engagement-metrics">Engagement metriky</option>
          <option value="predictions">Predikce (AI/ML)</option>
        </select>
        {/* AI segment dropdown */}
        <select name="segment" value={form.segment} onChange={handleFormChange} className="border px-2 py-1 rounded w-32">
          <option value="">AI segment</option>
          {aiSegments.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="region" value={form.region} onChange={handleFormChange} placeholder="Region" className="border px-2 py-1 rounded w-24" />
        <input name="ageMin" value={form.ageMin} onChange={handleFormChange} placeholder="Věk od" className="border px-2 py-1 rounded w-16" type="number" min="0" />
        <input name="ageMax" value={form.ageMax} onChange={handleFormChange} placeholder="Věk do" className="border px-2 py-1 rounded w-16" type="number" min="0" />
        <input name="channel" value={form.channel} onChange={handleFormChange} placeholder="Kanál (in-app, email...)" className="border px-2 py-1 rounded w-24" />
        {form.filterType === 'predictions' && (
          <input name="predType" value={form.predType} onChange={handleFormChange} placeholder="Typ predikce (churn, followup...)" className="border px-2 py-1 rounded w-32" />
        )}
        <select name="format" value={form.format} onChange={handleFormChange} className="border px-2 py-1 rounded">
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <select name="frequency" value={form.frequency} onChange={handleFormChange} className="border px-2 py-1 rounded">
          <option value="daily">Denně</option>
          <option value="weekly">Týdně</option>
          <option value="monthly">Měsíčně</option>
          <option value="once">Jednorázově</option>
        </select>
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox" name="active" checked={form.active} onChange={handleFormChange} /> Aktivní
        </label>
        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={creating}>Vytvořit webhook</button>
      </form>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full text-xs border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">URL</th>
            <th className="border px-2 py-1">Event</th>
            <th className="border px-2 py-1">Export</th>
            <th className="border px-2 py-1">Filtry</th>
            <th className="border px-2 py-1">Formát</th>
            <th className="border px-2 py-1">Frekvence</th>
            <th className="border px-2 py-1">Stav</th>
            <th className="border px-2 py-1">Akce</th>
          </tr>
        </thead>
        <tbody>
          {webhooks.map(w => (
            <tr key={w._id}>
              <td className="border px-2 py-1 font-mono text-xs break-all">{w.url}</td>
              <td className="border px-2 py-1">{w.event}</td>
              <td className="border px-2 py-1">{w.filter?.type}</td>
              <td className="border px-2 py-1 text-xs">
                {w.filter?.segment && <div><b>Segment:</b> {w.filter.segment}</div>}
                {w.filter?.region && <div><b>Region:</b> {w.filter.region}</div>}
                {w.filter?.ageMin && <div><b>Věk od:</b> {w.filter.ageMin}</div>}
                {w.filter?.ageMax && <div><b>Věk do:</b> {w.filter.ageMax}</div>}
                {w.filter?.channel && <div><b>Kanál:</b> {w.filter.channel}</div>}
                {w.filter?.predType && <div><b>Typ predikce:</b> {w.filter.predType}</div>}
              </td>
              <td className="border px-2 py-1">{w.format}</td>
              <td className="border px-2 py-1">{w.frequency}</td>
              <td className="border px-2 py-1">{w.lastStatus} {w.lastTriggered && (<span className="text-gray-500">({new Date(w.lastTriggered).toLocaleString()})</span>)}<br/>{w.lastResponse}</td>
              <td className="border px-2 py-1 flex flex-col gap-1">
                <button onClick={() => handleTrigger(w._id)} disabled={triggering===w._id} className="bg-blue-600 text-white px-2 py-1 rounded">Spustit</button>
                <button onClick={() => fetchHistory(w._id)} className="bg-gray-600 text-white px-2 py-1 rounded">Historie</button>
                <button onClick={() => handleToggleActive(w._id, w.active)} className={w.active ? 'bg-yellow-600 text-white px-2 py-1 rounded' : 'bg-green-600 text-white px-2 py-1 rounded'}>
                  {w.active ? 'Deaktivovat' : 'Aktivovat'}
                </button>
                <button onClick={() => handleDelete(w._id)} className="bg-red-600 text-white px-2 py-1 rounded">Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {Object.entries(history).map(([id, logs]) => (
        <div key={id} className="mb-4">
          <h4 className="font-semibold">Historie webhooku {id}</h4>
          <table className="w-full text-xs border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Čas</th>
                <th className="border px-2 py-1">Stav</th>
                <th className="border px-2 py-1">Odpověď/Chyba</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l._id}>
                  <td className="border px-2 py-1">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">{l.details?.status}</td>
                  <td className="border px-2 py-1">{l.details?.response || l.details?.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
