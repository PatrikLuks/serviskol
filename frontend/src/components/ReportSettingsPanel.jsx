import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ReportSettingsPanel() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    emails: '',
    frequency: 'weekly',
    enabled: true,
    enabledSections: ['aiSummary','ctrTrend','heatmap'],
    dateFrom: '',
    dateTo: '',
    scheduledSend: false
  });

  const sectionOptions = [
    { key: 'aiSummary', label: 'AI sumarizace' },
    { key: 'ctrTrend', label: 'Trend CTR' },
    { key: 'heatmap', label: 'Heatmapa segmentů' }
    // Další sekce lze přidat zde
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/report-settings');
      setSettings(res.data);
    } catch (e) {
      setError('Chyba načítání nastavení');
    }
    setLoading(false);
  }

  function handleEdit(s) {
    setEdit(s._id);
    setForm({
      emails: s.emails.join(', '),
      frequency: s.frequency,
      enabled: s.enabled,
      enabledSections: s.enabledSections || ['aiSummary','ctrTrend','heatmap'],
      dateFrom: s.dateFrom ? s.dateFrom.slice(0,10) : '',
      dateTo: s.dateTo ? s.dateTo.slice(0,10) : '',
      scheduledSend: !!s.scheduledSend
    });
  }

  async function handleSave() {
    const payload = {
      emails: form.emails.split(',').map(e => e.trim()).filter(Boolean),
      frequency: form.frequency,
      enabled: form.enabled,
      enabledSections: form.enabledSections,
      dateFrom: form.dateFrom ? new Date(form.dateFrom) : undefined,
      dateTo: form.dateTo ? new Date(form.dateTo) : undefined,
      scheduledSend: form.scheduledSend
    };
    if (edit) {
      await axios.patch(`/api/admin/report-settings/${edit}`, payload);
    } else {
      await axios.post('/api/admin/report-settings', payload);
    }
    setEdit(null);
    setForm({ emails: '', frequency: 'weekly', enabled: true, enabledSections: ['aiSummary','ctrTrend','heatmap'], dateFrom: '', dateTo: '', scheduledSend: false });
    fetchSettings();
  }

  async function handleDelete(id) {
    await axios.delete(`/api/admin/report-settings/${id}`);
    fetchSettings();
  }

  return (
    <div className="border rounded p-4 mb-6 bg-gray-50">
      <h3 className="font-bold mb-2">Nastavení automatického reportingu</h3>
      {loading ? <div>Načítání...</div> : error ? <div className="text-red-500">{error}</div> : (
        <>
          <table className="w-full text-sm mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1">Příjemci</th>
                <th className="p-1">Frekvence</th>
                <th className="p-1">Aktivní</th>
                <th className="p-1">Plánované</th>
                <th className="p-1">Od</th>
                <th className="p-1">Do</th>
                <th className="p-1">Poslední odeslání</th>
                <th className="p-1"></th>
              </tr>
            </thead>
            <tbody>
              {settings.map(s => (
                <tr key={s._id}>
                  <td className="p-1">{s.emails.join(', ')}</td>
                  <td className="p-1">{s.frequency === 'weekly' ? 'Týdně' : 'Měsíčně'}</td>
                  <td className="p-1">{s.enabled ? 'Ano' : 'Ne'}</td>
                  <td className="p-1">{s.scheduledSend ? 'Ano' : 'Ne'}</td>
                  <td className="p-1">{s.dateFrom ? s.dateFrom.slice(0,10) : ''}</td>
                  <td className="p-1">{s.dateTo ? s.dateTo.slice(0,10) : ''}</td>
                  <td className="p-1">{s.lastSentAt ? new Date(s.lastSentAt).toLocaleString('cs-CZ') : ''}</td>
                  <td className="p-1">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 mr-2">Upravit</button>
                    <button onClick={() => handleDelete(s._id)} className="text-red-600">Smazat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mb-2 font-semibold">{edit ? 'Upravit nastavení' : 'Přidat nové nastavení'}</div>
          <div className="flex gap-2 mb-2 flex-wrap">
            <input
              type="text"
              placeholder="E-maily (oddělené čárkou)"
              value={form.emails}
              onChange={e => setForm(f => ({ ...f, emails: e.target.value }))}
              className="border p-1 rounded w-64"
            />
            <select
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
              className="border p-1 rounded"
            >
              <option value="weekly">Týdně</option>
              <option value="monthly">Měsíčně</option>
            </select>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
              /> Aktivní
            </label>
            <div className="flex items-center gap-2">
              {sectionOptions.map(opt => (
                <label key={opt.key} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={form.enabledSections.includes(opt.key)}
                    onChange={e => {
                      setForm(f => ({
                        ...f,
                        enabledSections: e.target.checked
                          ? [...f.enabledSections, opt.key]
                          : f.enabledSections.filter(k => k !== opt.key)
                      }));
                    }}
                  /> {opt.label}
                </label>
              ))}
            </div>
            <input
              type="date"
              value={form.dateFrom}
              onChange={e => setForm(f => ({ ...f, dateFrom: e.target.value }))}
              className="border p-1 rounded"
              title="Od kdy zahrnout data"
            />
            <input
              type="date"
              value={form.dateTo}
              onChange={e => setForm(f => ({ ...f, dateTo: e.target.value }))}
              className="border p-1 rounded"
              title="Do kdy zahrnout data"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={form.scheduledSend}
                onChange={e => setForm(f => ({ ...f, scheduledSend: e.target.checked }))}
              /> Plánované rozesílání
            </label>
            <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Uložit</button>
            {edit && <button onClick={() => { setEdit(null); setForm({ emails: '', frequency: 'weekly', enabled: true, enabledSections: ['aiSummary','ctrTrend','heatmap'], dateFrom: '', dateTo: '', scheduledSend: false }); }} className="ml-2 text-gray-600">Zrušit</button>}
          </div>
        </>
      )}
    </div>
  );
}
