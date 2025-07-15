// ai-dashboard/components/OnboardingFeedbackForm.js
import { useState } from 'react';

export default function OnboardingFeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/onboarding-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error('Chyba při odesílání zpětné vazby');
      setStatus('Zpětná vazba byla úspěšně odeslána. Děkujeme!');
      setFeedback('');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-green-50 dark:bg-green-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding zpětná vazba</h2>
      <textarea
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 mb-2"
        rows={3}
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Napište svou zkušenost nebo návrh na zlepšení..."
        required
      />
      <button
        type="submit"
        className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        disabled={loading}
      >
        Odeslat zpětnou vazbu
      </button>
      {status && <div className="mt-2 text-sm text-green-800 dark:text-green-200">{status}</div>}
    </form>
  );
}
