import React, { useState } from 'react';
import Button from '@mui/material/Button';

export default function IntakeForm({ bikeId }) {
  const [form, setForm] = useState({ symptoms: '', usage: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendation, setRecommendation] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRecommendation('');
    if (!form.symptoms || !form.usage) {
      setError('Vyplňte příznaky a způsob používání.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...form, bikeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba při odesílání dotazníku');
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-2">Příjmový dotazník s AI asistencí</h2>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <textarea
          className="p-2 rounded border"
          name="symptoms"
          placeholder="Popište příznaky (např. pískání brzd, špatné řazení)"
          value={form.symptoms}
          onChange={handleChange}
        />
        <input
          className="p-2 rounded border"
          name="usage"
          placeholder="Jak často a kde kolo používáte?"
          value={form.usage}
          onChange={handleChange}
        />
        <textarea
          className="p-2 rounded border"
          name="notes"
          placeholder="Poznámky (volitelné)"
          value={form.notes}
          onChange={handleChange}
        />
        <Button type="submit" variant="contained" color="success" disabled={loading}>
          {loading ? 'Odesílám...' : 'Získat doporučení'}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
      {recommendation && (
        <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded">
          <b>Doporučení AI:</b> {recommendation}
        </div>
      )}
    </div>
  );
}
