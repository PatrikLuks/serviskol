import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Komponenta pro zobrazení predikce kanálu a vysvětlení podle decision tree
export default function DecisionTreeChannel({ userId }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    axios.get(`/api/admin/user/${userId}/decision-tree-channel`)
      .then(res => {
        if (mounted) setResult(res.data);
      })
      .catch(() => setError('chyba'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [userId]);

  if (loading) return <span>...</span>;
  if (error || !result) return <span className="text-red-500">{error || 'chyba'}</span>;
  return (
    <span title={result.explanation} className="cursor-help">
      {result.channel}
    </span>
  );
}
