import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import ReactGA from 'react-ga4';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTwoFAError('');
    if (!form.email || !form.password) {
      setError('Vyplňte všechna pole.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.status === 401 && data.twoFactorRequired) {
        setTwoFARequired(true);
        return;
      }
      if (!res.ok) throw new Error(data.msg || (data.errors && data.errors[0]?.msg) || 'Chyba přihlášení');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (localStorage.getItem('analyticsOptOut') !== 'true') {
        ReactGA.event({ category: 'user', action: 'login', label: 'standard' });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setTwoFAError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/2fa/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, token: twoFACode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba ověření 2FA');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setTwoFAError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Přihlášení</h2>
      {twoFARequired ? (
        <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handle2FASubmit}>
          <input
            className="p-2 rounded border"
            type="text"
            name="twofa"
            placeholder="2FA kód z aplikace"
            value={twoFACode}
            onChange={e => setTwoFACode(e.target.value)}
          />
          <Button type="submit" variant="contained" color="success" disabled={loading}>
            {loading ? 'Ověřuji...' : 'Ověřit a přihlásit'}
          </Button>
          {twoFAError && <div className="text-red-500 text-sm mt-2">{twoFAError}</div>}
        </form>
      ) : (
        <form className="flex flex-col gap-4 w-full max-w-xs" onSubmit={handleSubmit}>
          <input
            className="p-2 rounded border"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="p-2 rounded border"
            type="password"
            name="password"
            placeholder="Heslo"
            value={form.password}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="success" disabled={loading}>
            {loading ? 'Přihlašuji...' : 'Přihlásit se'}
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      )}
    </div>
  );
}
