import React, { useState } from 'react';
import FollowupSegmentHeatmap from './FollowupSegmentHeatmap';
import SegmentDetailModal from './SegmentDetailModal';

export default function SegmentHeatmapWithDetail({ data }) {
  const [selected, setSelected] = useState(null);

  // Handler pro kliknutí na segment/kanál
  const handleRowClick = (row) => {
    setSelected(row);
  };

  return (
    <>
      <FollowupSegmentHeatmap data={data} onRowClick={handleRowClick} />
      {selected && (
        <SegmentDetailModal
          segment={selected.segment}
          channel={selected.channel}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
