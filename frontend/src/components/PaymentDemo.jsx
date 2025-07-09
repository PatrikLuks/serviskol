import React, { useState } from 'react';

export default function PaymentDemo() {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const handlePay = async () => {
    setStatus('');
    const res = await fetch('/api/payments/stripe/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ amount: Math.round(Number(amount) * 100), currency: 'czk' })
    });
    const data = await res.json();
    if (res.ok && data.clientSecret) {
      setStatus('Platba inicializována (demo, pokračujte ve Stripe).');
    } else {
      setStatus(data.msg || 'Chyba při platbě.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">Platba (Stripe demo)</h2>
      <input
        type="number"
        className="border rounded p-2 mb-2 w-full"
        placeholder="Částka v Kč"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={handlePay} className="bg-green-600 text-white px-4 py-2 rounded w-full">Zaplatit</button>
      {status && <div className="mt-2 text-blue-700">{status}</div>}
    </div>
  );
}
