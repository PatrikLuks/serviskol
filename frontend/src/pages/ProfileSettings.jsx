import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { registerPushToken } from '../utils/push';

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [channel, setChannel] = useState(user?.notificationChannel || 'in-app');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setChannel(user?.notificationChannel || 'in-app');
  }, [user]);

  useEffect(() => {
    if (user && user.notificationChannel === 'push') {
      registerPushToken();
    }
  }, [user]);

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

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">Nastavení notifikací</h2>
      <label className="block mb-2">Preferovaný kanál:</label>
      <select value={channel} onChange={handleChannelChange} className="border rounded p-2 mb-2">
        <option value="in-app">In-app (v aplikaci)</option>
        <option value="email">E-mail</option>
        <option value="push">Push notifikace</option>
      </select>
      {status && <div className="text-green-600 text-sm mt-2">{status}</div>}
    </div>
  );
};

export default ProfileSettings;
