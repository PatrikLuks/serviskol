import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const CHANNEL_LABELS = {
  'in-app': 'In-app',
  'email': 'E-mail',
  'push': 'Push',
  'sms': 'SMS'
};

export default function DecisionTreeChannelPieChart({ data }) {
  // data: [{ channel: 'in-app', count: 42 }, ...]
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="channel"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={entry => CHANNEL_LABELS[entry.channel] || entry.channel}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, props) => [`${value}`, CHANNEL_LABELS[props.payload.channel] || props.payload.channel]} />
        <Legend formatter={v => CHANNEL_LABELS[v] || v} />
      </PieChart>
    </ResponsiveContainer>
  );
}
