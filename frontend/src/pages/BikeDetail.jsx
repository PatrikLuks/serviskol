import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BikeDetail() {
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Zpět</button>
      {/* Zbytek komponenty */}
    </div>
  );
}