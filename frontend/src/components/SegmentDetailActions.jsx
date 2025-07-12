import React, { useState } from 'react';
import axios from 'axios';

export default function SegmentDetailActions({ segment, channel, onAction }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Spustit nebo naplánovat follow-up kampaň pro segment a kanál
  const handleFollowup = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await axios.post('/api/admin/alert-logs/execute-segment-followup', {
        segment,
        channel,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined
      });
      setResult(res.data.result === 'scheduled' ? 'Follow-up naplánován.' : 'Follow-up spuštěn.');
      if (onAction) onAction();
    } catch {
      setResult('Chyba při spouštění follow-upu.');
    }
    setLoading(false);
  };

  // Hromadná změna kanálu pro segment
  const handleChangeChannel = async () => {
    setLoading(true);
    setResult('');
    try {
      await axios.patch('/api/admin/users/bulk-preferred-channel', {
        segment,
        preferredChannel: channel
      });
      setResult('Kanál změněn všem v segmentu.');
      if (onAction) onAction();
    } catch {
      setResult('Chyba při změně kanálu.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleFollowup} disabled={loading}>Spustit follow-up</button>
        <button className="px-3 py-1 bg-gray-600 text-white rounded" onClick={handleChangeChannel} disabled={loading}>Změnit kanál</button>
        {result && <span className="ml-2 text-sm text-green-700">{result}</span>}
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-xs">Naplánovat follow-up na:</label>
        <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="border p-1 text-xs" />
      </div>
    </div>
  );
}
