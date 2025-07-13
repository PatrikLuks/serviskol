import React, { useState } from 'react';

export default function AiSuggestVariantButton({ automationId, worstVariant, onSuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const handleActivate = async () => {
    if (!suggestion) return;
    setActivating(true);
    setError(null);
    try {
      const res = await fetch('/api/bi/alerts/activate-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId, variantText: suggestion })
      });
      const data = await res.json();
      if (data.success) {
        setActivated(true);
      } else {
        setError(data.error || 'Chyba aktivace varianty.');
      }
    } catch (e) {
      setError('Chyba komunikace s backendem.');
    }
    setActivating(false);
  };

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bi/alerts/suggest-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ automationId, worstVariant })
      });
      const data = await res.json();
      if (data.suggestion) {
        setSuggestion(data.suggestion);
        if (onSuggestion) onSuggestion(data.suggestion);
      } else {
        setError(data.error || 'Chyba AI návrhu.');
      }
    } catch (e) {
      setError('Chyba komunikace s AI.');
    }
    setLoading(false);
  };

  return (
    <div style={{marginTop: 8}}>
      <button onClick={handleSuggest} disabled={loading}>
        {loading ? 'Generuji návrh…' : 'Navrhnout novou variantu (AI)'}
      </button>
      {suggestion && (
        <div style={{marginTop: 8, background: '#f6f6f6', padding: 8}}>
          <b>Návrh AI:</b><br/>{suggestion}
          {!activated ? (
            <div style={{marginTop: 8}}>
              <button onClick={handleActivate} disabled={activating}>
                {activating ? 'Aktivuji…' : 'Aktivovat tuto variantu'}
              </button>
            </div>
          ) : (
            <div style={{color: 'green', marginTop: 8}}>Varianta byla úspěšně aktivována!</div>
          )}
        </div>
      )}
      {error && <div style={{color: 'red'}}>{error}</div>}
    </div>
  );
}
