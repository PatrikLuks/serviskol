import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SEGMENTS = ['VIP', 'aktivní', 'riziko_odchodu', 'ostatní'];
const CHANNELS = ['in-app', 'email', 'push'];

export default function FollowupAutomationPanel() {
  const [automations, setAutomations] = useState([]);
  const [form, setForm] = useState({ triggerSegment: 'riziko_odchodu', channel: 'in-app', messageTemplate: '', active: true, variants: [] });
  const [variantForm, setVariantForm] = useState({ label: '', messageTemplate: '', active: true });
  const [editingVariant, setEditingVariant] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  // AI návrh šablony
  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('/api/admin/followup-automation/ai-suggest', {
        segment: form.triggerSegment,
        variantLabel: variantForm.label
      });
      setVariantForm(f => ({ ...f, messageTemplate: res.data.suggestion }));
    } catch {
      setError('Chyba při generování šablony AI');
    }
    setAiLoading(false);
  };
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/followup-automation');
      setAutomations(res.data);
    } catch {
      setError('Chyba při načítání automatizací');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAutomations(); }, []);


  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Varianty (A/B test)
  const handleVariantChange = e => {
    const { name, value, type, checked } = e.target;
    setVariantForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleAddVariant = e => {
    e.preventDefault();
    setForm(f => ({ ...f, variants: [...(f.variants || []), { ...variantForm }] }));
    setVariantForm({ label: '', messageTemplate: '', active: true });
    setEditingVariant(null);
  };
  const handleEditVariant = (v, idx) => {
    setVariantForm(v);
    setEditingVariant(idx);
  };
  const handleSaveVariant = e => {
    e.preventDefault();
    setForm(f => ({ ...f, variants: f.variants.map((v, i) => i === editingVariant ? { ...variantForm } : v) }));
    setVariantForm({ label: '', messageTemplate: '', active: true });
    setEditingVariant(null);
  };
  const handleDeleteVariant = idx => {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await axios.patch(`/api/admin/followup-automation/${editing}`, form);
      } else {
        await axios.post('/api/admin/followup-automation', form);
      }
      setForm({ triggerSegment: 'riziko_odchodu', channel: 'in-app', messageTemplate: '', active: true });
      setEditing(null);
      fetchAutomations();
    } catch {
      setError('Chyba při ukládání');
    }
    setLoading(false);
  };

  const handleEdit = a => {
    setForm({ ...a });
    setEditing(a._id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Opravdu smazat tuto automatizaci?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/admin/followup-automation/${id}`);
      fetchAutomations();
    } catch {
      setError('Chyba při mazání');
    }
    setLoading(false);
  };

  return (
    <div className="mb-8">
      <h3 className="font-bold mb-2">Automatizace follow-upů (rizikové segmenty)</h3>
      <form className="flex flex-wrap gap-2 items-end mb-4" onSubmit={handleSubmit}>
        <select name="triggerSegment" value={form.triggerSegment} onChange={handleChange} className="border px-2 py-1 rounded">
          {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="channel" value={form.channel} onChange={handleChange} className="border px-2 py-1 rounded">
          {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="messageTemplate" value={form.messageTemplate} onChange={handleChange} placeholder="Výchozí šablona (fallback)" className="border px-2 py-1 rounded w-64" />
        <label className="flex items-center gap-1 text-xs">
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> Aktivní
        </label>
        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">{editing ? 'Uložit změny' : 'Přidat'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ triggerSegment: 'riziko_odchodu', channel: 'in-app', messageTemplate: '', active: true, variants: [] }); setVariantForm({ label: '', messageTemplate: '', active: true }); setEditingVariant(null); }} className="bg-gray-400 text-white px-3 py-1 rounded">Zrušit</button>}
      </form>
      {/* Správa variant (A/B test) */}
      <div className="mb-2">
        <b>Varianty (A/B test):</b>
        <form className="flex gap-2 items-end mt-1" onSubmit={editingVariant !== null ? handleSaveVariant : handleAddVariant}>
          <input name="label" value={variantForm.label} onChange={handleVariantChange} placeholder="Název varianty (A/B)" className="border px-2 py-1 rounded w-24" />
          <input name="messageTemplate" value={variantForm.messageTemplate} onChange={handleVariantChange} placeholder="Šablona zprávy" className="border px-2 py-1 rounded w-64" required />
          <button type="button" onClick={handleAiSuggest} className="bg-purple-600 text-white px-2 py-1 rounded" disabled={aiLoading}>{aiLoading ? 'AI generuje...' : 'Navrhnout šablonu (AI)'}</button>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" name="active" checked={variantForm.active} onChange={handleVariantChange} /> Aktivní
          </label>
          <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">{editingVariant !== null ? 'Uložit' : 'Přidat variantu'}</button>
          {editingVariant !== null && <button type="button" onClick={() => { setEditingVariant(null); setVariantForm({ label: '', messageTemplate: '', active: true }); }} className="bg-gray-400 text-white px-2 py-1 rounded">Zrušit</button>}
        </form>
        <table className="w-full text-xs border mt-2">
          <thead>
            <tr className="bg-gray-50">
              <th className="border px-2 py-1">Název</th>
              <th className="border px-2 py-1">Šablona</th>
              <th className="border px-2 py-1">Stav</th>
              <th className="border px-2 py-1">Akce</th>
            </tr>
          </thead>
          <tbody>
            {(form.variants || []).map((v, i) => (
              <tr key={i}>
                <td className="border px-2 py-1">{v.label}</td>
                <td className="border px-2 py-1">{v.messageTemplate}</td>
                <td className="border px-2 py-1">{v.active ? 'Aktivní' : 'Neaktivní'}</td>
                <td className="border px-2 py-1 flex gap-1">
                  <button type="button" onClick={() => handleEditVariant(v, i)} className="bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                  <button type="button" onClick={() => handleDeleteVariant(i)} className="bg-red-600 text-white px-2 py-1 rounded">Smazat</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full text-xs border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Segment</th>
            <th className="border px-2 py-1">Kanál</th>
            <th className="border px-2 py-1">Šablona/varianty</th>
            <th className="border px-2 py-1">Stav</th>
            <th className="border px-2 py-1">Akce</th>
          </tr>
        </thead>
        <tbody>
          {automations.map(a => (
            <tr key={a._id}>
              <td className="border px-2 py-1 font-bold">{a.triggerSegment}</td>
              <td className="border px-2 py-1">{a.channel}</td>
              <td className="border px-2 py-1">
                {a.messageTemplate && <div><b>Výchozí:</b> {a.messageTemplate}</div>}
                {(a.variants || []).map((v, i) => (
                  <div key={i} className="ml-2">• <b>{v.label}:</b> {v.messageTemplate} {v.active ? '' : <span className="text-gray-400">(neaktivní)</span>}</div>
                ))}
              </td>
              <td className="border px-2 py-1">{a.active ? 'Aktivní' : 'Neaktivní'}</td>
              <td className="border px-2 py-1 flex gap-1">
                <button onClick={() => handleEdit(a)} className="bg-blue-600 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(a._id)} className="bg-red-600 text-white px-2 py-1 rounded">Smazat</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
