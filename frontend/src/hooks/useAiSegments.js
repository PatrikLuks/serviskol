// Získání AI segmentů z backendu
import { useEffect, useState } from 'react';
import axios from 'axios';

export function useAiSegments() {
  const [aiSegments, setAiSegments] = useState([]);
  useEffect(() => {
    axios.get('/api/bi/segments/ai').then(res => {
      setAiSegments(res.data.aiSegments?.map(s => s._id).filter(Boolean) || []);
    }).catch(() => setAiSegments([]));
  }, []);
  return aiSegments;
}
