import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoyaltyWidget() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);
  const [badges, setBadges] = useState([]);

  const prevLevelRef = React.useRef(level);
  const prevBadgesRef = React.useRef(badges);

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/loyalty', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setPoints(data.points);
          setHistory(data.history || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchPoints();
  }, []);

  useEffect(() => {
    const fetchGamification = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/loyalty/gamification', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setLevel(data.level);
          setBadges(data.badges || []);
        }
      } catch {}
    };
    fetchGamification();
  }, [points]);

  useEffect(() => {
    if (level > prevLevelRef.current) {
      toast.success(`Gratulujeme! Získali jste novou úroveň: ${level}`);
    }
    if (badges.length > prevBadgesRef.current.length) {
      const newBadges = badges.filter(b => !prevBadgesRef.current.includes(b));
      newBadges.forEach(b => toast.info(`Nový odznak: ${b}`));
    }
    prevLevelRef.current = level;
    prevBadgesRef.current = badges;
  }, [level, badges]);

  return (
    <div className="p-4 border rounded bg-white max-w-xs mx-auto mt-6">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <h2 className="text-lg font-bold mb-2">Věrnostní program</h2>
      {loading ? (
        <div>Načítám...</div>
      ) : (
        <>
          <div className="text-2xl font-bold text-green-600 mb-2">{points} bodů</div>
          <div className="text-sm text-gray-500 mb-2">Za servis, doporučení, aktivitu v chatu…</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-2xl">★</span>
            <span className="font-bold">Úroveň {level}</span>
          </div>
          {badges.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Odznaky:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {badges.map((b, i) => (
                  <span key={i} className="bg-green-200 text-green-900 px-2 py-1 rounded text-xs font-semibold border border-green-400">{b}</span>
                ))}
              </div>
            </div>
          )}
          <h3 className="font-semibold mt-2 mb-1">Historie bodů</h3>
          <ul className="text-xs list-disc ml-4">
            {history.length === 0 && <li>Žádná historie</li>}
            {history.map((h, i) => (
              <li key={i}>{new Date(h.date).toLocaleDateString()} +{h.amount} – {h.reason}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
