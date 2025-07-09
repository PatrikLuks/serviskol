import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email })
      });
      toast.success('Děkujeme za zpětnou vazbu!');
      setMessage('');
      setEmail('');
    } catch (err) {
      toast.error('Odeslání selhalo. Zkuste to prosím znovu.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">Zpětná vazba</h2>
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={4}
        placeholder="Vaše zpětná vazba..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
      />
      <input
        className="w-full border rounded p-2 mb-2"
        type="email"
        placeholder="Váš e-mail (nepovinné)"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading || !message}
      >
        Odeslat
      </button>
    </form>
  );
};

export default FeedbackForm;
