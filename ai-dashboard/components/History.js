import { useState, useEffect } from 'react';

  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDiff, setSelectedDiff] = useState([]); // indexy vybraných pro diff
  // Přidání/odebrání výstupu do diff porovnání
  function handleToggleDiff(idx) {
    setSelectedDiff(prev => {
      if (prev.includes(idx)) {
        return prev.filter(i => i !== idx);
      } else if (prev.length < 2) {
        return [...prev, idx];
      } else {
        // Pokud už jsou dva, nahradí první
        return [prev[1], idx];
      }
    });
  }

  // Jednoduchý diff dvou stringů (řádkově)
  function renderDiff(a, b) {
    if (!a || !b) return null;
    const aLines = a.split('\n');
    const bLines = b.split('\n');
    const maxLen = Math.max(aLines.length, bLines.length);
    let out = [];
    for (let i = 0; i < maxLen; i++) {
      if (aLines[i] === bLines[i]) {
        out.push(<div key={i} className="bg-white text-gray-700 px-2">{aLines[i] || <>&nbsp;</>}</div>);
      } else {
        out.push(
          <div key={i} className="flex">
            <span className="bg-red-100 text-red-700 w-1/2 px-2">{aLines[i] || <>&nbsp;</>}</span>
            <span className="bg-green-100 text-green-700 w-1/2 px-2">{bLines[i] || <>&nbsp;</>}</span>
          </div>
        );
      }
    }
    return <div className="mt-4 border rounded text-xs">{out}</div>;
  }

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('aiHistory') || '[]');
    setHistory(h);
  }, []);

  // Uloží změny historie do localStorage
  function saveHistory(newHistory) {
    setHistory(newHistory);
    localStorage.setItem('aiHistory', JSON.stringify(newHistory));
  }
  // Přepínání oblíbenosti výstupu
  function handleToggleFavorite(idx) {
    const newHistory = [...history];
    newHistory[idx] = { ...newHistory[idx], favorite: !newHistory[idx].favorite };
    saveHistory(newHistory);
  }

  function handleClearHistory() {
    localStorage.removeItem('aiHistory');
    setHistory([]);
  }

  function handleSelect(item) {
    onSelect(item.result);
  }


  function handleDownload(item) {
    const blob = new Blob([item.result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vystup_${item.date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportAll() {
    if (!history.length) return;
    // Markdown export: každý výstup oddělený nadpisem a datem
    const md = history.map((item, i) => `## Výstup ${i + 1} (${item.date})\n\n${item.result}\n`).join('\n---\n\n');
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-vystupy-${new Date().toISOString().slice(0,10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }




  // Filtrování a řazení: oblíbené nahoře
  let filtered = history.filter(item =>
    (item.result && item.result.toLowerCase().includes(search.toLowerCase())) ||
    (item.date && item.date.toLowerCase().includes(search.toLowerCase()))
  );
  filtered = filtered.sort((a, b) => (b.favorite === true) - (a.favorite === true));

  if (!history.length) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Historie výstupů</h2>
        <div className="flex gap-2">
          <button
            className="text-xs underline text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-400"
            onClick={handleExportAll}
            title="Exportovat celou historii"
          >
            Exportovat vše
          </button>
          <button
            className="text-xs underline text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-400"
            onClick={handleClearHistory}
            title="Smazat celou historii"
          >
            Smazat vše
          </button>
        </div>
      </div>
      <input
        type="text"
        className="w-full mb-2 px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        placeholder="Vyhledat v historii..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="space-y-2">
        {filtered.length === 0 ? (
          <li className="text-gray-400 dark:text-gray-500 text-sm">Žádné výsledky</li>
        ) : (
          filtered.map((item, i) => {
            // Najdi index v původní historii pro správné přepínání oblíbenosti
            const origIdx = history.findIndex(h => h.date === item.date && h.result === item.result);
            const isSelected = selectedDiff.includes(origIdx);
            return (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleDiff(origIdx)}
                  disabled={!isSelected && selectedDiff.length >= 2}
                  title="Porovnat výstup"
                  className="accent-blue-500"
                />
                <button
                  className={"text-lg focus:outline-none " + (item.favorite ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400 dark:text-yellow-300 dark:hover:text-yellow-400")}
                  title={item.favorite ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                  onClick={() => handleToggleFavorite(origIdx)}
                  aria-label="Oblíbený výstup"
                >
                  ★
                </button>
                <button className="underline text-green-700 dark:text-green-300" onClick={() => handleSelect(item)}>
                  Výstup {item.date}
                </button>
                <button className="text-xs text-gray-500 underline dark:text-gray-400" onClick={() => handleDownload(item)}>
                  stáhnout
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Diff dvou vybraných výstupů */}
      {selectedDiff.length === 2 && (
        <div className="mt-6 p-4 border-2 border-blue-300 dark:border-blue-700 rounded bg-blue-50 dark:bg-blue-950">
          <div className="font-semibold mb-2">Porovnání vybraných výstupů</div>
          <div className="flex gap-2 text-xs mb-2">
            <span className="w-1/2 text-center text-gray-500 dark:text-gray-400">Výstup 1</span>
            <span className="w-1/2 text-center text-gray-500 dark:text-gray-400">Výstup 2</span>
          </div>
          {renderDiff(history[selectedDiff[0]].result, history[selectedDiff[1]].result)}
        </div>
      )}
    </div>
  );
}
