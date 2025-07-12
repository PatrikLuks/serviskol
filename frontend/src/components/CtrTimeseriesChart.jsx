import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function CtrTimeseriesChart({ data, channels }) {
  // data: { days: [...], timeseries: { in-app: [...], email: [...], ... }, sends: { in-app: [...], ... } }
  if (!data || !data.days || !data.timeseries || !data.sends) return null;
  // Připravit data pro graf
  const chartData = data.days.map((date, i) => {
    const row = { date };
    channels.forEach(ch => {
      const clicks = data.timeseries[ch]?.[i]?.count || 0;
      const sent = data.sends[ch]?.[i]?.count || 0;
      row[ch] = sent > 0 ? (clicks / sent) * 100 : 0;
    });
    return row;
  });

  // --- Predikce trendu (lineární regrese) ---
  // Pro každý kanál spočítat lineární trend a přidat predikovanou čáru
  const predLines = channels.map(ch => {
    // Vzít pouze dny s daty
    const y = chartData.map(row => row[ch]).filter(v => typeof v === 'number');
    if (y.length < 2) return null;
    // x = 0..n-1
    const x = y.map((_, i) => i);
    // Výpočet lineární regrese y = a*x + b
    const n = y.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    const a = (n * sumXY - sumX * sumY) / denom;
    const b = (sumY * sumX2 - sumX * sumXY) / denom;
    // Predikce pro každý den
    const pred = x.map(xi => a * xi + b);
    // Připravit data pro graf
    const predData = chartData.map((row, i) => ({ date: row.date, [`${ch}_trend`]: pred[i] }));
    return { ch, predData };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" minTickGap={10} />
        <YAxis allowDecimals={false} domain={[0, 100]} tickFormatter={v => v + '%'} />
        <Tooltip formatter={v => v.toFixed(1) + '%'} />
        <Legend />
        {channels.map(ch => (
          <Line key={ch} type="monotone" dataKey={ch} stroke={channelColor(ch)} dot={false} />
        ))}
        {predLines.map((pl, i) => pl && (
          <Line
            key={pl.ch + '_trend'}
            type="monotone"
            dataKey={pl.ch + '_trend'}
            data={pl.predData}
            stroke={channelColor(pl.ch)}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            legendType="none"
          />
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
