import React, { useEffect, useState } from 'react';
import LoyaltyWidget from '../components/LoyaltyWidget';
import Leaderboard from '../components/Leaderboard';
import Rewards from '../components/Rewards';
import { Button } from '@mui/material';

export default function Home() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/integrations/weather?lat=50.08&lon=14.43', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setWeather(data);
    };
    fetchWeather();
  }, []);

  function handleExport() {
    const token = localStorage.getItem('token');
    fetch('/api/export/service-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'servisni-historie.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-2">ServisKol</h1>
      <h2 className="text-3xl font-bold mb-4">Domovská stránka</h2>
      <p>Vítejte v aplikaci Serviskol!</p>
      <Button variant="outlined" color="primary" className="mb-4" onClick={handleExport}>
        Exportovat servisní historii (CSV)
      </Button>
      {weather && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
          <span className="text-2xl">{weather.icon}</span>
          <span>{weather.weather}, {weather.temperature}°C – {weather.description}</span>
        </div>
      )}
      <LoyaltyWidget />
      <Leaderboard />
      <Rewards />
    </div>
  );
}
