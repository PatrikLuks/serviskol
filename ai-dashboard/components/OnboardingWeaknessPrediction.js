// ai-dashboard/components/OnboardingWeaknessPrediction.js
import { useEffect, useState } from 'react';

export default function OnboardingWeaknessPrediction() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPrediction() {
      try {
        const res = await fetch('/api/admin/onboarding-predict-weaknesses');
        if (!res.ok) throw new Error('Chyba při načítání predikce slabin');
        const data = await res.json();
        setPrediction(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPrediction();
  }, []);

  if (loading) return <div>Načítám AI predikci slabin onboarding procesu...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!prediction) return null;

  return (
    <div className="bg-pink-50 dark:bg-pink-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">AI predikce slabin onboarding procesu</h2>
      <div className="mb-2 font-semibold">Predikce: {prediction.prediction}</div>
      <h3 className="font-semibold mt-4 mb-2">Preventivní opatření:</h3>
      <ul className="list-disc pl-6">
        {prediction.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
      </ul>
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold">Zobrazit relevantní feedbacky</summary>
        <ul className="list-disc pl-6 text-sm">
          {prediction.feedbacks.map((f, idx) => <li key={idx}>{f}</li>)}
        </ul>
      </details>
    </div>
  );
}
