import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EngagementTimeseriesChart({ data, channels }) {
  // data: { days: [...], timeseries: { in-app: [...], email: [...], ... } }
  if (!data || !data.days || !data.timeseries) return null;
  // Připravit data pro graf
  const chartData = data.days.map((date, i) => {
    const row = { date };
    channels.forEach(ch => {
      row[ch] = data.timeseries[ch]?.[i]?.count || 0;
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" minTickGap={10} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {channels.map(ch => (
          <Line key={ch} type="monotone" dataKey={ch} stroke={channelColor(ch)} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function channelColor(ch) {
  switch (ch) {
    case 'in-app': return '#2563eb';
    case 'email': return '#059669';
    case 'push': return '#f59e42';
    case 'sms': return '#e11d48';
    default: return '#888';
  }
}
