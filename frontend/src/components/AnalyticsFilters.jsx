import React, { useState } from 'react';

const AnalyticsFilters = ({ onChange }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [type, setType] = useState('');
  const [mechanic, setMechanic] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onChange({ from, to, type, mechanic });
  };

  return (
    <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleSubmit}>
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded p-1" placeholder="Od" />
      <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded p-1" placeholder="Do" />
      <select value={type} onChange={e => setType(e.target.value)} className="border rounded p-1">
        <option value="">Všechny typy</option>
        <option value="Initial">Úvodní servis</option>
        <option value="Complex">Komplexní servis</option>
        <option value="QuickFix">Rychlo fix</option>
      </select>
      <input type="text" value={mechanic} onChange={e => setMechanic(e.target.value)} className="border rounded p-1" placeholder="ID technika" />
      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Filtrovat</button>
    </form>
  );
};

export default AnalyticsFilters;
