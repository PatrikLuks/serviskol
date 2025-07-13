import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuickFilterBar from './QuickFilterBar';

export default function AIFeedbackExportPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [since, setSince] = useState('');
  const [feedback, setFeedback] = useState('');
  const [relevance, setRelevance] = useState('');
  const [segment, setSegment] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (!aiQuery) {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(
        logs.filter(l =>
          (l.proposedAction?.message && l.proposedAction.message.toLowerCase().includes(aiQuery.toLowerCase())) ||
          (l.segment && JSON.stringify(l.segment).toLowerCase().includes(aiQuery.toLowerCase())) ||
          (l.aiFeedbackComment && l.aiFeedbackComment.toLowerCase().includes(aiQuery.toLowerCase()))
        )
      );
    }
  }, [aiQuery, logs]);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (since) params.since = since;
      if (feedback) params.feedback = feedback;
      if (relevance) params.relevance = relevance;
      if (segment) params.segment = segment;
      const res = await axios.get('/api/admin/ai-feedback-export', { params });
      setLogs(res.data);
    } catch (e) {
      setError('Chyba při načítání AI feedbacku.');
    }
    setLoading(false);
  }

  function exportCsv() {
    const params = {};
    if (since) params.since = since;
    if (feedback) params.feedback = feedback;
    if (relevance) params.relevance = relevance;
    if (segment) params.segment = segment;
    params.format = 'csv';
    const url = '/api/admin/ai-feedback-export?' + new URLSearchParams(params).toString();
    window.open(url, '_blank');
  }

  return (
    <div style={{marginTop:32}}>
      <h3>Export AI feedbacku (pro audit a trénink AI)</h3>
      <QuickFilterBar query={aiQuery} setQuery={setAiQuery} onSearch={()=>{}} />
      <div style={{marginBottom:8}}>
        <input type="date" value={since} onChange={e=>setSince(e.target.value)} />
        <select value={feedback} onChange={e=>setFeedback(e.target.value)} style={{marginLeft:8}}>
          <option value="">Feedback</option>
          <option value="excellent">Vynikající</option>
          <option value="good">Dobré</option>
          <option value="neutral">Neutrální</option>
          <option value="bad">Špatné</option>
          <option value="irrelevant">Mimo</option>
        </select>
        <select value={relevance} onChange={e=>setRelevance(e.target.value)} style={{marginLeft:8}}>
          <option value="">Relevance</option>
          <option value="relevant">Relevantní</option>
          <option value="irrelevant">Irelevantní</option>
        </select>
        <input type="text" placeholder="Segment" value={segment} onChange={e=>setSegment(e.target.value)} style={{marginLeft:8}} />
        <button onClick={fetchLogs} style={{marginLeft:8}}>Filtrovat</button>
        <button onClick={exportCsv} style={{marginLeft:8}}>Export CSV</button>
      </div>
      {loading ? <div>Načítám…</div> : error ? <div style={{color:'red'}}>{error}</div> : (
        <table style={{width:'100%',fontSize:13}}>
          <thead>
            <tr>
              <th>Segment</th>
              <th>AI návrh</th>
              <th>Feedback</th>
              <th>Relevance</th>
              <th>Komentář</th>
              <th>Schváleno</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((l,i) => (
              <tr key={i}>
                <td><pre style={{fontSize:11,whiteSpace:'pre-wrap'}}>{JSON.stringify(l.segment,null,1)}</pre></td>
                <td>{l.proposedAction?.message}</td>
                <td>{l.aiFeedback}</td>
                <td>{l.aiFeedbackRelevance}</td>
                <td>{l.aiFeedbackComment}</td>
                <td>{l.approvalStatus}</td>
                <td>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
