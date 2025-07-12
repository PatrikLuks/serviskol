import React from 'react';

// Jednoduchý sloupcový graf pro porovnání výkonu variant
const AbCampaignChart = ({ campaign }) => {
  if (!campaign || !campaign.variants || campaign.variants.length === 0) return null;
  const maxClicks = Math.max(...campaign.variants.map(v => v.clickCount || 0), 1);
  return (
    <div className="my-4">
      <div className="font-semibold mb-2">Porovnání výkonu variant (prokliky)</div>
      <div className="flex gap-4 items-end h-32">
        {campaign.variants.map((v, i) => (
          <div key={v.label} className="flex flex-col items-center">
            <div
              className="bg-green-500 w-8 rounded-t"
              style={{ height: `${(v.clickCount || 0) / maxClicks * 100}%`, minHeight: 8 }}
              title={`Prokliky: ${v.clickCount}`}
            />
            <div className="text-xs mt-1">{v.label}</div>
            <div className="text-xs">{v.clickCount || 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbCampaignChart;
