import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SegmentHeatmapWithDetail from './SegmentHeatmapWithDetail';

export default function SegmentHeatmapAnalytics() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filtrování podle kanálu/segmentu (volitelné rozšíření)
  const [channelFilter, setChannelFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/channel-engagement-drop-recommendations')
      .then(res => {
        // Převod backend dat na formát pro heatmapu
        // allSegments: [{ segment: {role, region, ageGroup}, channel, prev30, last30 }]
        const rows = (res.data.allSegments || []).map(row => {
          const segmentKey = `${row.segment.role}|${row.segment.region}|${row.segment.ageGroup}|${row.channel}`;
          const ctr = row.prev30 > 0 ? row.last30 / row.prev30 : 0;
          return {
            segmentKey,
            ctr,
            sent: row.last30,
            channel: row.channel,
            segment: row.segment
          };
        });
        setHeatmapData(rows);
        setLoading(false);
      })
      .catch(() => {
        setError('Chyba při načítání dat pro heatmapu.');
        setLoading(false);
      });
  }, []);

  // Filtrování podle kanálu (volitelné)
  const filtered = channelFilter ? heatmapData.filter(r => r.channel === channelFilter) : heatmapData;
  const uniqueChannels = Array.from(new Set(heatmapData.map(r => r.channel)));

  return (
    <section className="mb-8 p-4 border rounded bg-blue-50">
      <h2 className="text-xl font-bold mb-2">Heatmapa engagementu podle segmentu a kanálu</h2>
      <div className="mb-2 flex gap-2 items-center">
        <span>Kanál:</span>
        <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="border p-1">
          <option value="">Všechny</option>
          {uniqueChannels.map(ch => <option key={ch} value={ch}>{ch}</option>)}
        </select>
      </div>
      {loading ? <div>Načítání...</div> : error ? <div className="text-red-500">{error}</div> : (
        <SegmentHeatmapWithDetail data={filtered} />
      )}
    </section>
  );
}
