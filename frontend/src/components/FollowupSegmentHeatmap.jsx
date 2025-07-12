import React from 'react';

// data: [{ segmentKey, ctr, sent }]
export default function FollowupSegmentHeatmap({ data, onRowClick }) {
  // Najít unikátní segmenty a seřadit podle CTR
  const sorted = [...data].sort((a, b) => b.ctr - a.ctr);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-1">Segment</th>
            <th className="border p-1">CTR</th>
            <th className="border p-1">Odesláno</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={row.segmentKey}
              style={{ background: `rgba(37,99,235,${0.1 + 0.6 * row.ctr})`, cursor: onRowClick ? 'pointer' : undefined }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              <td className="border p-1">{row.segmentKey}</td>
              <td className="border p-1 font-bold">{(row.ctr*100).toFixed(1)}%</td>
              <td className="border p-1">{row.sent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
