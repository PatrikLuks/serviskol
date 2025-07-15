import { useState } from 'react';
import { usePermissions, hasPermission } from '../utils/permissions';
import { useSession } from 'next-auth/react';
import { logUnauthorizedAccess } from '../utils/logUnauthorized';


  const permissions = usePermissions();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('workflow');
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();
  const canPropose = hasPermission(permissions, 'proposal:create');

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setTitle('');
    setBody('');
    setType('workflow');
  }

  if (!canPropose) {
    if (session?.user) {
      logUnauthorizedAccess({
        user: session.user,
        action: 'create',
        section: 'new-automation-proposal',
      });
    }
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Navrhnout novou AI automatizaci / úpravu</h2>
        <div className="text-gray-600 dark:text-gray-300">Nemáte oprávnění navrhovat nové automatizace. Kontaktujte správce.</div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Navrhnout novou AI automatizaci / úpravu</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Název návrhu</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Popis / detail</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} required rows={3} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Typ</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full border rounded px-2 py-1">
            <option value="workflow">Workflow</option>
            <option value="prompt">Prompt</option>
            <option value="report">Report</option>
            <option value="jiné">Jiné</option>
          </select>
        </div>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Odeslat návrh</button>
        {submitted && <div className="text-green-600 mt-2">Návrh byl odeslán ke schválení (demo).</div>}
      </form>
    </div>
  );
