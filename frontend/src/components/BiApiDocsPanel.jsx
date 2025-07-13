import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BiApiDocsPanel() {
  const [docs, setDocs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/bi/docs')
      .then(res => setDocs(res.data))
      .catch(() => setError('Chyba při načítání dokumentace'));
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!docs) return <div>Načítám dokumentaci...</div>;

  return (
    <div className="mt-8 p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2 text-lg">BI API dokumentace</h3>
      <div className="mb-4 text-sm text-gray-700">{docs.description}</div>
      <table className="w-full text-xs border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Endpoint</th>
            <th className="border px-2 py-1">Metoda</th>
            <th className="border px-2 py-1">Popis</th>
            <th className="border px-2 py-1">Oprávnění</th>
            <th className="border px-2 py-1">Příklad</th>
          </tr>
        </thead>
        <tbody>
          {docs.endpoints.map(ep => (
            <tr key={ep.path}>
              <td className="border px-2 py-1 font-mono">{ep.path}</td>
              <td className="border px-2 py-1">{ep.method}</td>
              <td className="border px-2 py-1">{ep.description}<br/>
                {ep.params.map(p => (
                  <div key={p.name}><b>{p.name}</b>: {p.type} <span className="text-gray-500">{p.desc}</span></div>
                ))}
              </td>
              <td className="border px-2 py-1">{ep.permissions.join(', ')}</td>
              <td className="border px-2 py-1">
                {ep.example?.curl && <div><b>curl:</b> <code>{ep.example.curl}</code></div>}
                {ep.example?.powerbi && <div><b>Power BI:</b> <code>{ep.example.powerbi}</code></div>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-600">
        <ul className="list-disc ml-6">
          {docs.notes.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      </div>
    </div>
  );
}
