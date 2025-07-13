import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuickFilterBar from './QuickFilterBar';

export default function AlertApprovalPanel() {
  const [alerts, setAlerts] = useState([]);
  const [autoApproved, setAutoApproved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [actionResult, setActionResult] = useState('');
  const [alertQuery, setAlertQuery] = useState('');
  const [filteredAlerts, setFilteredAlerts] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/api/admin/alert-logs', { params: { approvalStatus: 'pending' } }),
      axios.get('/api/admin/alert-logs', { params: { approvalStatus: 'auto' } })
    ])
      .then(([pendingRes, autoRes]) => {
        setAlerts(pendingRes.data.filter(a => a.proposedAction));
        setAutoApproved(autoRes.data.filter(a => a.proposedAction));
        setLoading(false);
      })
      .catch(() => {
        setError('Chyba při načítání alertů.');
        setLoading(false);
      });
  }, [actionResult]);

  useEffect(() => {
    if (!alertQuery) {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(
        alerts.filter(a =>
          (a.message && a.message.toLowerCase().includes(alertQuery.toLowerCase())) ||
          (a.segment && Object.values(a.segment).join(' ').toLowerCase().includes(alertQuery.toLowerCase())) ||
          (a.proposedAction?.message && a.proposedAction.message.toLowerCase().includes(alertQuery.toLowerCase()))
        )
      );
    }
  }, [alertQuery, alerts]);

  const handleOverride = async (alert, newStatus) => {
    setActionResult('');
    try {
      await axios.patch(`/api/admin/alert-logs/${alert._id}/override-approval`, { newStatus });
      setActionResult('Auto-approval byl přepsán.');
    } catch {
      setActionResult('Chyba při override.');
    }
  };

  const handleApprove = async (alert) => {
    setActionResult('');
    try {
      // Umožnit adminovi upravit návrh zprávy před schválením
      if (editMessage && editMessage !== alert.proposedAction.message) {
        // PATCH na AlertLog pro úpravu návrhu před schválením
        await axios.patch(`/api/admin/alert-logs/${alert._id}`, {
          proposedAction: { ...alert.proposedAction, message: editMessage }
        });
      }
      await axios.patch(`/api/admin/alert-logs/${alert._id}/approve-action`);
      setEditing(null);
      setActionResult('Návrh schválen.');
    } catch {
      setActionResult('Chyba při schvalování.');
    }
  };

  const handleReject = async (alert) => {
    setActionResult('');
    try {
      await axios.patch(`/api/admin/alert-logs/${alert._id}/reject-action`);
      setEditing(null);
      setActionResult('Návrh zamítnut.');
    } catch {
      setActionResult('Chyba při zamítnutí.');
    }
  };

  if (loading) return <div>Načítání návrhů ke schválení...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Panel pro auto-schválené návrhy
  const autoPanel = autoApproved.length > 0 && (
    <div className="mb-8 p-4 border rounded bg-green-50">
      <div className="font-bold mb-2 text-green-900">Automaticky schválené návrhy (AI auto-approval)</div>
      <QuickFilterBar query={alertQuery} setQuery={setAlertQuery} onSearch={()=>{}} />
      {filteredAlerts.map(alert => (
        <div key={alert._id} className="mb-4 p-2 border rounded bg-white">
          <div className="mb-1 text-sm text-gray-700">
            <b>Segment:</b> {Object.entries(alert.segment || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
            <span className="ml-2"><b>AI návrh:</b> {alert.proposedAction?.aiSuggestion ? 'ANO' : 'NE'}</span>
          </div>
          <div className="mb-1 text-xs text-gray-600">{alert.message}</div>
          <div className="mb-1">
            <b>Návrh follow-up zprávy:</b> <span className="ml-2 italic">{alert.proposedAction?.message}</span>
          </div>
          {alert.proposedAction?.aiSummary && (
            <div className="mb-1 text-xs text-blue-700 bg-blue-50 rounded p-2">
              <b>AI vysvětlení a predikce dopadu:</b> {alert.proposedAction.aiSummary}
            </div>
          )}
          <div className="flex gap-2 mt-2 items-center">
            <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => handleOverride(alert, 'approved')}>Potvrdit schválení</button>
            <button className="px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={() => handleOverride(alert, 'rejected')}>Zamítnout</button>
          </div>
        </div>
      ))}
    </div>
  );

  if (!alerts.length && !autoApproved.length) return <div className="text-gray-500">Žádné návrhy ke schválení.</div>;

  return (
    <>
      {autoPanel}
      <div className="mb-8 p-4 border rounded bg-yellow-50">
        <div className="font-bold mb-2">Návrhy akcí ke schválení</div>
        {alerts.map(alert => (
          <div key={alert._id} className="mb-4 p-2 border rounded bg-white">
          <div className="mb-1 text-sm text-gray-700">
            <b>Segment:</b> {Object.entries(alert.segment || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}
            <span className="ml-2"><b>AI návrh:</b> {alert.proposedAction?.aiSuggestion ? 'ANO' : 'NE'}</span>
          </div>
          <div className="mb-1 text-xs text-gray-600">{alert.message}</div>
          <div className="mb-1">
            <b>Návrh follow-up zprávy:</b>
            {editing === alert._id ? (
              <textarea
                className="border p-1 w-full mt-1"
                rows={2}
                value={editMessage}
                onChange={e => setEditMessage(e.target.value)}
              />
            ) : (
              <span className="ml-2 italic">{alert.proposedAction?.message}</span>
            )}
          </div>
          {alert.proposedAction?.aiSummary && (
            <div className="mb-1 text-xs text-blue-700 bg-blue-50 rounded p-2">
              <b>AI vysvětlení a predikce dopadu:</b> {alert.proposedAction.aiSummary}
            </div>
          )}
          <div className="flex gap-2 mt-2 items-center">
            {editing === alert._id ? (
              <>
                <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => handleApprove(alert)}>Schválit</button>
                <button className="px-2 py-1 bg-gray-500 text-white rounded text-xs" onClick={() => setEditing(null)}>Zrušit</button>
              </>
            ) : (
              <>
                <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => { setEditing(alert._id); setEditMessage(alert.proposedAction?.message || ''); }}>Upravit a schválit</button>
                <button className="px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={() => handleReject(alert)}>Zamítnout</button>
              </>
            )}
            {/* AI feedback tlačítka + komentář a relevance */}
            <span className="ml-4 text-xs text-gray-500">AI feedback:</span>
            <button className={`px-2 py-1 rounded text-xs ${alert.aiFeedback==='excellent'?'bg-green-200':'bg-gray-100'}`} onClick={async()=>{
              await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:'excellent'}); setActionResult('AI feedback uložen.');
            }}>Vynikající</button>
            <button className={`px-2 py-1 rounded text-xs ${alert.aiFeedback==='good'?'bg-green-100':'bg-gray-100'}`} onClick={async()=>{
              await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:'good'}); setActionResult('AI feedback uložen.');
            }}>Dobré</button>
            <button className={`px-2 py-1 rounded text-xs ${alert.aiFeedback==='bad'?'bg-red-200':'bg-gray-100'}`} onClick={async()=>{
              await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:'bad'}); setActionResult('AI feedback uložen.');
            }}>Špatné</button>
            <button className={`px-2 py-1 rounded text-xs ${alert.aiFeedback==='irrelevant'?'bg-yellow-200':'bg-gray-100'}`} onClick={async()=>{
              await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:'irrelevant'}); setActionResult('AI feedback uložen.');
            }}>Mimo</button>
            <select className="ml-2 text-xs border rounded" value={alert.aiFeedbackRelevance||''} onChange={async e=>{
              await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:alert.aiFeedback||'neutral',relevanceType:e.target.value}); setActionResult('Relevance uložena.');
            }}>
              <option value="">Relevance</option>
              <option value="relevant">Relevantní</option>
              <option value="irrelevant">Irelevantní</option>
            </select>
            <input className="ml-2 text-xs border rounded px-1" style={{width:120}} placeholder="Komentář" defaultValue={alert.aiFeedbackComment||''} onBlur={async e=>{
              if(e.target.value!==alert.aiFeedbackComment){
                await axios.patch(`/api/admin/alert-logs/${alert._id}/ai-feedback`,{feedback:alert.aiFeedback||'neutral',comment:e.target.value}); setActionResult('Komentář uložen.');
              }
            }} />
          </div>
        </div>
      ))}
      {actionResult && <div className="text-green-700 text-sm mt-2">{actionResult}</div>}
    </div>
  </>);
}
