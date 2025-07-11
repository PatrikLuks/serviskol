import React, { useEffect, useState, useRef } from 'react';
import Button from '@mui/material/Button';

export default function ChatBox({ bikeId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/chat/${bikeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setMessages(data);
      } catch {
        // ignorováno
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // polling každých 5s
    return () => clearInterval(interval);
  }, [bikeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/${bikeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Chyba při odesílání zprávy');
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white max-w-md mx-auto mt-6">
      <h2 className="text-lg font-bold mb-2">Chat s technikem</h2>
      <div className="h-48 overflow-y-auto bg-gray-50 border rounded p-2 mb-2" style={{ minHeight: 150 }}>
        {messages.map((m, i) => (
          <div key={i} className={`mb-1 ${m.userId === user.id ? 'text-right' : 'text-left'}`}>
            <span className="inline-block px-2 py-1 rounded bg-green-100 text-sm">
              <b>{m.userId?.name || 'Uživatel'}:</b> {m.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex gap-2" onSubmit={handleSend}>
        <input
          className="flex-1 p-2 rounded border"
          type="text"
          placeholder="Napište zprávu..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="success" disabled={loading || !text.trim()}>
          Odeslat
        </Button>
      </form>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
}
