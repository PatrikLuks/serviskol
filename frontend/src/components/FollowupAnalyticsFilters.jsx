import React from 'react';

export default function FollowupAnalyticsFilters({ filters, setFilters, segmentOptions }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <select value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))} className="border p-1">
        <option value="">Všechny role</option>
        {segmentOptions.roles.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select value={filters.region} onChange={e => setFilters(f => ({ ...f, region: e.target.value }))} className="border p-1">
        <option value="">Všechny regiony</option>
        {segmentOptions.regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select value={filters.ageGroup} onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))} className="border p-1">
        <option value="">Všechny věkové skupiny</option>
        {segmentOptions.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <input type="date" value={filters.since} onChange={e => setFilters(f => ({ ...f, since: e.target.value }))} className="border p-1" placeholder="Od data" />
      <input type="date" value={filters.until} onChange={e => setFilters(f => ({ ...f, until: e.target.value }))} className="border p-1" placeholder="Do data" />
      <input type="number" min="0" max="100" value={filters.ctrMin} onChange={e => setFilters(f => ({ ...f, ctrMin: e.target.value }))} className="border p-1 w-24" placeholder="Min. CTR %" />
      <input type="number" min="0" max="100" value={filters.ctrMax} onChange={e => setFilters(f => ({ ...f, ctrMax: e.target.value }))} className="border p-1 w-24" placeholder="Max. CTR %" />
    </div>
  );
}
