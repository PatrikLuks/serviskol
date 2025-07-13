import React, { useEffect, useState } from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import axios from 'axios';

const SEGMENTS = ['VIP', 'aktivní', 'riziko_odchodu', 'ostatní'];

export default function SegmentTransitionHeatmap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/bi/ai-segment-history')
      .then(res => {
        // Sestavit matici přechodů segmentů
        const transitions = {};
        for (const from of SEGMENTS) transitions[from] = { from, ...Object.fromEntries(SEGMENTS.map(s => [s, 0])) };
        let prev = {};
        res.data.history.forEach(h => {
          const u = h.userId;
          if (prev[u] && prev[u] !== h.newSegment) {
            transitions[prev[u]][h.newSegment]++;
          }
          prev[u] = h.newSegment;
        });
        setData(Object.values(transitions));
      })
      .catch(() => setError('Chyba při načítání historie'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-8">
      <h3 className="font-bold mb-2">Heatmapa přechodů AI segmentů</h3>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div style={{ height: 350 }}>
        <ResponsiveHeatMap
          data={data}
          keys={SEGMENTS}
          indexBy="from"
          margin={{ top: 40, right: 60, bottom: 40, left: 60 }}
          axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: 0 }}
          axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0 }}
          colors="YlOrRd"
          cellOpacity={1}
          cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
          animate={true}
          isInteractive={true}
        />
      </div>
    </div>
  );
}
