import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import SegmentDetailActions from './SegmentDetailActions';
import SegmentAIFollowupSuggestion from './SegmentAIFollowupSuggestion';
import SegmentABFollowupForm from './SegmentABFollowupForm';
import SegmentABFollowupResults from './SegmentABFollowupResults';

export default function SegmentDetailModal({ segment, channel, onClose }) {
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    // Backend endpoint na trend: /api/admin/segment-engagement-trends/export-csv nebo obdobný
    axios.get('/api/admin/segment-engagement-trends', {
      params: {
        role: segment.role,
        region: segment.region,
        ageGroup: segment.ageGroup,
        channel
      }
    })
      .then(res => {
        setTrend(res.data.trend || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Chyba při načítání trendu.');
        setLoading(false);
      });
  }, [segment, channel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[350px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold text-lg">Detail segmentu</div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>
        <div className="mb-2 text-sm text-gray-700">
          <b>Role:</b> {segment.role} <b>Region:</b> {segment.region} <b>Věk:</b> {segment.ageGroup} <b>Kanál:</b> {channel}
        </div>
        {loading ? <div>Načítání trendu...</div> : error ? <div className="text-red-500">{error}</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        )}
        <SegmentAIFollowupSuggestion segment={segment} channel={channel} />
        <SegmentDetailActions segment={segment} channel={channel} />
        <SegmentABFollowupForm segment={segment} channel={channel} />
        <SegmentABFollowupResults segment={segment} channel={channel} />
      </div>
    </div>
  );
}
