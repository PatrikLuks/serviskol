import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePermissions, hasPermission } from '../utils/permissions';

const DEFAULT_PROMPTS = [
  'Pracuj strategicky podle tohoto zadání:',
  'Pokračuj ve strategické práci, navrhni další kroky:',
  'Rozděl projekt na fáze a popiš priority:'
];

export default function PromptManager({ onChange, value }) {
  const { data: session } = useSession();
  const permissions = usePermissions();
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');

  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('aiPrompts') || 'null') || DEFAULT_PROMPTS;
    setPrompts(p);
    if (!value && p.length) onChange(p[0]);
  }, []);

  function addPrompt() {
    if (newPrompt.trim() && !prompts.includes(newPrompt.trim())) {
      const updated = [...prompts, newPrompt.trim()];
      setPrompts(updated);
      localStorage.setItem('aiPrompts', JSON.stringify(updated));
      setNewPrompt('');
    }
  }

  function removePrompt(idx) {
    const updated = prompts.filter((_, i) => i !== idx);
    setPrompts(updated);
    localStorage.setItem('aiPrompts', JSON.stringify(updated));
    if (updated.length && value === prompts[idx]) onChange(updated[0]);
  }

  function resetPrompts() {
    setPrompts(DEFAULT_PROMPTS);
    localStorage.setItem('aiPrompts', JSON.stringify(DEFAULT_PROMPTS));
    onChange(DEFAULT_PROMPTS[0]);
  }

  return (
    <div className="mt-8">
      <h2 className="font-semibold mb-2">Správa promptů</h2>
      <ul className="space-y-1 mb-2">
        {prompts.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <button className={"underline "+(value===p?"text-green-700 font-bold":"text-gray-700")}
              onClick={() => onChange(p)}>{p}</button>
            {hasPermission(permissions, 'prompt:edit') ? (
              prompts.length > 1 && (
                <button className="text-xs text-red-500 underline" onClick={() => removePrompt(i)}>smazat</button>
              )
            ) : null}
          </li>
        ))}
      </ul>
      {hasPermission(permissions, 'prompt:edit') ? (
        <>
          <div className="flex gap-2 mb-2">
            <input value={newPrompt} onChange={e => setNewPrompt(e.target.value)} className="border rounded p-1 flex-1" placeholder="Nový prompt..." />
            <button className="bg-green-600 text-white px-2 rounded" onClick={addPrompt}>přidat</button>
          </div>
          <button className="text-xs text-gray-500 underline" onClick={resetPrompts}>obnovit výchozí prompty</button>
        </>
      ) : (
        <div className="text-xs text-gray-400 italic">Pouze ke čtení – pro úpravy kontaktujte admina.</div>
      )}
    </div>
  );
}
