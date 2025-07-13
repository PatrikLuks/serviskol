import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RetentionTrendChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: 120, marginTop: 8 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis dataKey="date" fontSize={10} tick={{fontSize:10}}/>
          <YAxis domain={[0, 100]} fontSize={10} tick={{fontSize:10}}/>
          <Tooltip formatter={(v) => v + ' %'} />
          <Line type="monotone" dataKey="retention" stroke="#1976d2" strokeWidth={2} dot={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
