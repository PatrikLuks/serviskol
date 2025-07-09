import React, { useEffect, useState } from 'react';

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [status, setStatus] = useState('');
  useEffect(() => {
    fetch('/api/gamification/rewards', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(setRewards);
  }, []);

  const claim = async (rewardId) => {
    setStatus('');
    const res = await fetch('/api/gamification/claim', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ rewardId })
    });
    const data = await res.json();
    if (res.ok) setStatus('Odměna přidělena!');
    else setStatus(data.msg || 'Chyba při nárokování odměny.');
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Odměny</h2>
      {rewards.map(r => (
        <div key={r._id} className="flex items-center mb-4">
          {r.icon && <img src={r.icon} alt="" className="w-8 h-8 mr-2" />}
          <div className="flex-1">
            <div className="font-semibold">{r.name}</div>
            <div className="text-sm text-gray-600">{r.description}</div>
            <div className="text-green-700">+{r.points} bodů</div>
          </div>
          <button onClick={() => claim(r._id)} className="bg-blue-600 text-white px-3 py-1 rounded">Získat</button>
        </div>
      ))}
      {status && <div className="text-green-600 mt-2">{status}</div>}
    </div>
  );
}
