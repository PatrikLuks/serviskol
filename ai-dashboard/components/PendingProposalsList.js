import { useEffect, useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';

  const permissions = usePermissions();
  const [proposals, setProposals] = useState([]);
  const [log, setLog] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    // Prototyp: načítání návrhů z lokálního souboru (bude nahrazeno API)
    setProposals([
      { id: 1, title: 'Zlepšit onboarding AI', body: 'Navrhuji přidat AI asistenta do onboarding procesu.' },
      { id: 2, title: 'Automatizovat testy incidentů', body: 'AI doporučuje generovat testy pro každý nový incident.' }
    ]);
  }, []);

  function handleAction(id, status) {
    const proposal = proposals.find(p => p.id === id);
    setLog(l => [...l, { ...proposal, status, timestamp: new Date().toISOString() }]);
    setProposals(ps => ps.filter(p => p.id !== id));
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">AI návrhy ke schválení</h2>
      {proposals.length === 0 ? (
        <div className="text-gray-500">Žádné čekající návrhy.</div>
      ) : (
        <ul className="space-y-3">
          {proposals.map(p => (
            <li key={p.id} className="border rounded p-3 bg-white dark:bg-gray-900 shadow">
              <div className="font-bold mb-1">{p.title}</div>
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">{p.body}</div>
              {hasPermission(permissions, 'proposal:approve') ? (
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => handleAction(p.id, 'approved')}>Schválit</button>
                  <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => handleAction(p.id, 'rejected')}>Zamítnout</button>
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  Pouze ke čtení – pro schvalování kontaktujte admina.
                  {session?.user && logUnauthorizedAccess({
                    user: session.user,
                    action: 'approve',
                    section: 'pending-proposals',
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {log.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-1">Auditní log (demo):</h3>
          <ul className="text-xs space-y-1">
            {log.map((l, i) => (
              <li key={i} className={l.status === 'approved' ? 'text-green-600' : 'text-red-600'}>
                [{l.timestamp}] {l.title} – {l.status === 'approved' ? 'Schváleno' : 'Zamítnuto'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
