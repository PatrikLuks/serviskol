import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('/api/gamification/leaderboard', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setData);
  }, []);
  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Žebříček uživatelů</h2>
      <ol className="list-decimal pl-6">
        {data.map((entry) => (
          <li key={entry.user._id} className="mb-2">
            <span className="font-semibold">{entry.user.name}</span> – {entry.points} bodů
          </li>
        ))}
      </ol>
    </div>
  );
}
