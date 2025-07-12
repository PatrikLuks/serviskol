import React from 'react';

export default function ChannelDropRecommendations({ data, onChangeChannel }) {
  if (!data || !data.recommendations) return null;
  if (data.recommendations.length === 0) return <div className="text-green-700">Žádné významné poklesy engagementu v segmentech.</div>;
  return (
    <table className="w-full border text-sm mb-6">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-1">Role</th>
          <th className="border p-1">Region</th>
          <th className="border p-1">Věková skupina</th>
          <th className="border p-1">Kanál</th>
          <th className="border p-1">Předchozích 30 dní</th>
          <th className="border p-1">Posledních 30 dní</th>
          <th className="border p-1">Pokles (%)</th>
          {onChangeChannel && <th className="border p-1">Akce</th>}
        </tr>
      </thead>
      <tbody>
        {data.recommendations.map((rec, i) => (
          <tr key={i}>
            <td className="border p-1">{rec.segment.role}</td>
            <td className="border p-1">{rec.segment.region}</td>
            <td className="border p-1">{rec.segment.ageGroup}</td>
            <td className="border p-1">{rec.channel}</td>
            <td className="border p-1">{rec.prev30}</td>
            <td className="border p-1">{rec.last30}</td>
            <td className="border p-1 text-red-600 font-bold">-{rec.drop}</td>
            {onChangeChannel && <td className="border p-1"><button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => onChangeChannel(rec)}>Změnit kanál</button></td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
