import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ReactGA from 'react-ga4';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [errorList, setErrorList] = useState([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password) {
      setError('Vyplňte všechna pole.');
      return;
    }
    // Přidána validace emailu na frontend
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      setError('Zadejte platný email.');
      return;
    }
    if (form.password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || (data.errors && data.errors[0]?.msg) || 'Chyba registrace');
      setSuccess('Registrace úspěšná. Můžete se přihlásit.');
      setForm({ name: '', email: '', password: '', role: 'client' });
      if (localStorage.getItem('analyticsOptOut') !== 'true') {
        ReactGA.event({ category: 'user', action: 'register', label: 'standard' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Registrace</h2>
        <input
          type="text"
          name="name"
          placeholder="Jméno"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Heslo"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <select name="role" value={form.role} onChange={handleChange} className="p-2 rounded border w-full mb-4">
          <option value="client">Klient</option>
          <option value="mechanic">Servisní technik</option>
        </select>
        <Button type="submit" variant="contained" color="success" disabled={loading} fullWidth>
          {loading ? 'Registruji...' : 'Registrovat'}
        </Button>
        {error && <div className="text-red-500 text-sm mb-2 mt-2">{error}</div>}
        {errorList.length > 0 && (
          <ul className="text-red-500 text-xs mb-2 list-disc list-inside">
            {errorList.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        )}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </div>
  );
}
