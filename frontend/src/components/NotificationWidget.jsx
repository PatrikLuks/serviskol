import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const NotificationWidget = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      });
  }, []);

  const markRead = async (ids) => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ ids })
    });
    setNotifications(notifications.map(n => ids.includes(n._id) ? { ...n, read: true } : n));
  };

  if (loading) return <div>Načítám notifikace...</div>;

  return (
    <div className="bg-white rounded shadow p-4 max-w-md mx-auto mt-4">
      <h2 className="font-bold mb-2">Notifikace</h2>
      {notifications.length === 0 && <div>Žádné notifikace.</div>}
      <ul>
        {notifications.map(n => (
          <li key={n._id} className={`mb-2 p-2 rounded ${n.read ? 'bg-gray-100' : 'bg-green-100'}`}>
            <div>{n.message}</div>
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
            {!n.read && (
              <button
                className="text-xs text-green-700 underline mt-1"
                onClick={() => markRead([n._id])}
              >Označit jako přečtené</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationWidget;
