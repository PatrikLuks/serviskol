import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/gamification/leaderboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setData);
  }, [user, token]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
        <h2 className="text-xl font-bold mb-4">Žebříček uživatelů</h2>
        <div className="text-red-600">Pro zobrazení žebříčku se prosím přihlaste.</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Žebříček uživatelů</h2>
      <ol className="list-decimal pl-6">
        {Array.isArray(data) ? (
          data.map((entry) => (
            <li key={entry.user._id} className="mb-2">
              <span className="font-semibold">{entry.user.name}</span> – {entry.points} bodů
            </li>
          ))
        ) : (
          <div className="text-red-600">Chyba načítání žebříčku nebo není k dispozici.</div>
        )}
      </ol>
    </div>
  );
}
