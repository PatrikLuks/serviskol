import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationWidget from '../components/NotificationWidget';
import FeedbackForm from '../components/FeedbackForm';
import WidgetBox from '../components/WidgetBox';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Pro zobrazení profilu se prosím přihlaste.');
      setLoading(false);
      return;
    }
    fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) throw new Error(data.msg);
        setUser(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Načítám profil...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow">
      <button onClick={() => navigate(-1)} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">← Zpět</button>
      <h2 className="text-2xl font-bold mb-4">Profil uživatele</h2>
      <div className="mb-2"><b>Jméno:</b> {user.name}</div>
      <div className="mb-2"><b>Email:</b> {user.email}</div>
      <div className="mb-2"><b>Role:</b> {user.role}</div>
      <div className="mb-2"><b>ID:</b> {user._id}</div>

      {/* Notifikace */}
      <div className="mt-8">
        <WidgetBox title="Notifikace">
          <NotificationWidget />
        </WidgetBox>
      </div>

      {/* Zpětná vazba */}
      <div className="mt-8">
        <WidgetBox title="Zpětná vazba">
          <FeedbackForm />
        </WidgetBox>
      </div>
    </div>
  );
}
