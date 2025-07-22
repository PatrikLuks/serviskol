import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerPushToken } from '../utils/push';
import { useNavigate } from 'react-router-dom';
import StravaConnect from '../components/StravaConnect';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [channel, setChannel] = useState(user?.notificationChannel || 'in-app');
  const [status, setStatus] = useState('');
  const [twoFA, setTwoFA] = useState({ enabled: user?.twoFactorEnabled || false, qr: '', secret: '', step: 'idle', code: '', error: '', success: '' });
  const [analyticsOptOut, setAnalyticsOptOut] = useState(localStorage.getItem('analyticsOptOut') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    setChannel(user?.notificationChannel || 'in-app');
  }, [user]);

  useEffect(() => {
    if (user && user.notificationChannel === 'push') {
      registerPushToken();
    }
  }, [user]);

  const fetch2FAStatus = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setTwoFA((prev) => ({ ...prev, enabled: data.twoFactorEnabled }));
    }
  };

  const handleChannelChange = async (e) => {
    const newChannel = e.target.value;
    setChannel(newChannel);
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/notification-channel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ channel: newChannel })
    });
    if (res.ok) setStatus('Uloženo!');
    else setStatus('Chyba při ukládání.');
  };

  const handleExportGDPR = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/gdpr/export', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serviskol-osobni-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteGDPR = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/gdpr/delete', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) alert('Žádost o výmaz byla zaznamenána. Správce vás bude kontaktovat.');
    else alert('Chyba při žádosti o výmaz.');
  };

  const handle2FASetup = async () => {
    setTwoFA((prev) => ({ ...prev, error: '', success: '', step: 'setup' }));
    const token = localStorage.getItem('token');
    const res = await fetch('/api/2fa/setup', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setTwoFA((prev) => ({ ...prev, qr: data.qr, secret: data.secret, step: 'verify' }));
    } else {
      setTwoFA((prev) => ({ ...prev, error: 'Chyba při generování 2FA.' }));
    }
  };

  const handle2FAVerify = async () => {
    setTwoFA((prev) => ({ ...prev, error: '', success: '' }));
    const token = localStorage.getItem('token');
    const res = await fetch('/api/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ token: twoFA.code })
    });
    if (res.ok) {
      setTwoFA((prev) => ({ ...prev, enabled: true, success: '2FA bylo úspěšně aktivováno!', step: 'idle', qr: '', secret: '', code: '' }));
    } else {
      const data = await res.json();
      setTwoFA((prev) => ({ ...prev, error: data.msg || 'Chyba při ověření 2FA.' }));
    }
  };

  const handle2FADisable = async () => {
    setTwoFA((prev) => ({ ...prev, error: '', success: '' }));
    const token = localStorage.getItem('token');
    const res = await fetch('/api/2fa/disable', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      setTwoFA((prev) => ({ ...prev, enabled: false, success: '2FA bylo deaktivováno.', step: 'idle', qr: '', secret: '', code: '' }));
    } else {
      setTwoFA((prev) => ({ ...prev, error: 'Chyba při deaktivaci 2FA.' }));
    }
  };

  const handleAnalyticsOptOut = (e) => {
    const checked = e.target.checked;
    setAnalyticsOptOut(checked);
    localStorage.setItem('analyticsOptOut', checked);
    window.location.reload(); // reload pro aplikaci změny
  };

  useEffect(() => {
    fetch2FAStatus();
  }, [user]);

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Zpět</button>
      <h2 className="text-lg font-bold mb-2">Nastavení notifikací</h2>
      <label className="block mb-2">Preferovaný kanál:</label>
      <select value={channel} onChange={handleChannelChange} className="border rounded p-2 mb-2">
        <option value="in-app">In-app (v aplikaci)</option>
        <option value="email">E-mail</option>
        <option value="push">Push notifikace</option>
      </select>
      {status && <div className="text-green-600 text-sm mt-2">{status}</div>}

      <h2 className="text-lg font-bold mb-2 mt-4">GDPR – Správa osobních dat</h2>
      <button onClick={handleExportGDPR} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">Exportovat osobní data</button>
      <button onClick={handleDeleteGDPR} className="bg-red-600 text-white px-4 py-2 rounded">Žádat o výmaz účtu</button>

      <h2 className="text-lg font-bold mb-2 mt-4">Dvoufaktorová autentizace (2FA)</h2>
      {twoFA.enabled ? (
        <div className="mb-4">
          <div className="text-green-700 mb-2">2FA je aktivní.</div>
          <button onClick={handle2FADisable} className="bg-red-600 text-white px-4 py-2 rounded">Deaktivovat 2FA</button>
        </div>
      ) : (
        <div className="mb-4">
          {twoFA.step === 'idle' && (
            <button onClick={handle2FASetup} className="bg-blue-600 text-white px-4 py-2 rounded">Aktivovat 2FA</button>
          )}
          {twoFA.step === 'setup' && <div>Načítání QR kódu…</div>}
          {twoFA.step === 'verify' && (
            <div>
              <div className="mb-2">Naskenujte QR kód v aplikaci Authenticator a zadejte ověřovací kód:</div>
              <img src={twoFA.qr} alt="QR kód pro 2FA" className="mb-2" style={{ width: 180, height: 180 }} />
              <input
                className="p-2 rounded border mb-2"
                type="text"
                placeholder="Kód z aplikace"
                value={twoFA.code}
                onChange={e => setTwoFA(prev => ({ ...prev, code: e.target.value }))}
              />
              <button onClick={handle2FAVerify} className="bg-green-600 text-white px-4 py-2 rounded ml-2">Ověřit a aktivovat</button>
            </div>
          )}
        </div>
      )}
      {twoFA.error && <div className="text-red-600 text-sm mb-2">{twoFA.error}</div>}
      {twoFA.success && <div className="text-green-600 text-sm mb-2">{twoFA.success}</div>}

      <h2 className="text-lg font-bold mb-2 mt-4">Propojení účtů</h2>
      <StravaConnect />

      <div className="mt-8">
        <label>
          <input type="checkbox" checked={analyticsOptOut} onChange={handleAnalyticsOptOut} />
          Neposílat anonymizovaná analytická data (opt-out)
        </label>
        <div className="text-xs text-gray-400 mt-2">
          Pro zlepšování aplikace využíváme anonymizovanou analytiku. Můžete ji zde kdykoliv vypnout.
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
