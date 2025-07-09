import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';

export default function Bikes() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brand: '', model: '', type: '', age: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchBikes = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bikes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba načítání kol');
      setBikes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.brand || !form.model || !form.type) {
      setFormError('Vyplňte všechna povinná pole.');
      return;
    }
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/bikes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba při přidávání kola');
      setForm({ brand: '', model: '', type: '', age: '' });
      setShowForm(false);
      fetchBikes();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Moje kola</h2>
      {loading && <div>Načítám...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-2">
        {bikes.map(bike => (
          <li key={bike._id} className="p-4 bg-primary-light rounded shadow">
            <b>{bike.brand} {bike.model}</b> ({bike.type})
            <br />
            <a href={`/bikes/${bike._id}`} className="text-primary-dark underline text-sm">Detail kola</a>
          </li>
        ))}
      </ul>
      <Button variant="contained" color="success" className="mt-6" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Zavřít formulář' : 'Přidat nové kolo'}
      </Button>
      {showForm && (
        <form className="flex flex-col gap-2 mt-4 max-w-sm" onSubmit={handleFormSubmit}>
          <input
            className="p-2 rounded border"
            type="text"
            name="brand"
            placeholder="Značka"
            value={form.brand}
            onChange={handleFormChange}
          />
          <input
            className="p-2 rounded border"
            type="text"
            name="model"
            placeholder="Model"
            value={form.model}
            onChange={handleFormChange}
          />
          <input
            className="p-2 rounded border"
            type="text"
            name="type"
            placeholder="Typ (např. silniční, horské)"
            value={form.type}
            onChange={handleFormChange}
          />
          <input
            className="p-2 rounded border"
            type="number"
            name="age"
            placeholder="Stáří (roky)"
            value={form.age}
            onChange={handleFormChange}
          />
          <Button type="submit" variant="contained" color="success" disabled={formLoading}>
            {formLoading ? 'Přidávám...' : 'Přidat kolo'}
          </Button>
          {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
        </form>
      )}
    </div>
  );
}
