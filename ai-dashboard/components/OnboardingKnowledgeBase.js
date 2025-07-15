// ai-dashboard/components/OnboardingKnowledgeBase.js
import { useEffect, useState } from 'react';

export default function OnboardingKnowledgeBase() {
  const [kb, setKb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchKb() {
      try {
        const res = await fetch('/api/admin/onboarding-knowledge-base');
        if (!res.ok) throw new Error('Chyba při načítání knowledge base');
        const data = await res.json();
        setKb(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchKb();
  }, []);

  function handleExport() {
    if (!kb) return;
    let text = '# Onboarding Knowledge Base\n\n';
    text += '## Lessons Learned\n';
    kb.lessonsLearned.forEach(l => { text += `- ${l}\n`; });
    text += '\n## Best Practices\n';
    kb.bestPractices.forEach(b => { text += `- ${b}\n`; });
    text += '\n## Incidenty\n';
    kb.incidents.forEach(i => { text += `- ${i}\n`; });
    text += '\n## Doporučené zásahy k incidentům\n';
    kb.incidentRecommendations.forEach(r => { text += `- ${r}\n`; });
    text += '\n## Roadmapa kontinuálního zlepšování\n';
    kb.improvementRoadmap.forEach(r => { text += `- ${r.title}: ${r.description} ${r.done ? '(splněno)' : ''}\n`; });
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'onboarding_knowledge_base.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div>Načítám onboarding knowledge base...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!kb) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-2">Onboarding Knowledge Base (AI)</h2>
      <h3 className="font-semibold mt-4 mb-2">Lessons Learned</h3>
      <ul className="list-disc pl-6 mb-4">
        {kb.lessonsLearned.map((l, idx) => <li key={idx}>{l}</li>)}
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Best Practices</h3>
      <ul className="list-disc pl-6 mb-4">
        {kb.bestPractices.map((b, idx) => <li key={idx}>{b}</li>)}
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Incidenty</h3>
      <ul className="list-disc pl-6 mb-4">
        {kb.incidents.map((i, idx) => <li key={idx}>{i}</li>)}
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Doporučené zásahy k incidentům</h3>
      <ul className="list-disc pl-6 mb-4">
        {kb.incidentRecommendations.map((r, idx) => <li key={idx}>{r}</li>)}
      </ul>
      <h3 className="font-semibold mt-4 mb-2">Roadmapa kontinuálního zlepšování</h3>
      <ul className="list-disc pl-6 mb-4">
        {kb.improvementRoadmap.map((r, idx) => <li key={idx}>{r.title}: {r.description} {r.done ? '(splněno)' : ''}</li>)}
      </ul>
      <button
        className="px-4 py-2 rounded bg-gray-700 text-white font-semibold hover:bg-gray-800 transition"
        onClick={handleExport}
      >
        Exportovat knowledge base (Markdown)
      </button>
    </div>
  );
}
